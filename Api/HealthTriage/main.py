from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
import os
import re
import requests

from database import init_db, save_patient, get_all_patients, get_patients_due_followup, delete_patient
from auth import (
    create_access_token, verify_password, get_user, create_user, token_required
)

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
client = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

# ─────────────────────────────────────────────
# SMS Helper — Fast2SMS
# ─────────────────────────────────────────────

def send_sms(phone: str, message: str, label: str = "SMS") -> bool:
    """Send SMS via Fast2SMS. Phone must be a 10-digit Indian number."""
    api_key = os.getenv("FAST2SMS_API_KEY")
    if not api_key:
        print(f"⚠️ FAST2SMS_API_KEY not set — skipping {label}")
        return False

    # Clean phone number — strip +91 or 91 prefix
    phone = re.sub(r"^\+?91", "", phone.strip())
    phone = re.sub(r"\D", "", phone)  # remove non-digits
    if len(phone) != 10:
        print(f"⚠️ Invalid phone for {label}: {phone}")
        return False

    # Fast2SMS has a 160 char limit per SMS — truncate cleanly
    if len(message) > 160:
        message = message[:157] + "..."

    try:
        response = requests.post(
            "https://www.fast2sms.com/dev/bulkV2",
            headers={"authorization": api_key},
            json={
                "route": "q",
                "message": message,
                "language": "english",
                "flash": 0,
                "numbers": phone,
            },
            timeout=10
        )
        result = response.json()
        if result.get("return"):
            print(f"✅ {label} sent to {phone}")
            return True
        else:
            print(f"❌ {label} failed: {result}")
            return False
    except Exception as e:
        print(f"❌ {label} error: {e}")
        return False

# ─────────────────────────────────────────────
# Parsers
# ─────────────────────────────────────────────

def parse_triage_result(result_text: str) -> dict:
    """Extract all patient details from the Gemini triage result."""
    data = {
        "patient_name": "Unknown",
        "patient_age": 0,
        "patient_gender": "Unknown",
        "symptoms": "See triage result",
        "patient_phone": None,
        "emergency_contact_name": None,
        "emergency_contact_phone": None,
        "followup_days": None,
        "is_emergency": False,
        "emergency_message": None,
        "recommended_action": None,
    }

    # Patient basic info
    patient_match = re.search(r"PATIENT:\s*(.+?),\s*(\d+)yr,\s*(.+)", result_text)
    if patient_match:
        data["patient_name"] = patient_match.group(1).strip()
        data["patient_age"] = int(patient_match.group(2).strip())
        data["patient_gender"] = patient_match.group(3).strip().split("\n")[0].strip()

    # Severity check
    if re.search(r"SEVERITY:\s*(HIGH|EMERGENCY)", result_text, re.IGNORECASE):
        data["is_emergency"] = True

    # Patient phone
    patient_phone_match = re.search(r"PATIENT PHONE:\s*([6-9]\d{9})", result_text)
    if patient_phone_match:
        data["patient_phone"] = patient_phone_match.group(1)

    # Emergency contact phone
    ec_phone_match = re.search(r"EMERGENCY CONTACT PHONE:\s*([6-9]\d{9})", result_text)
    if ec_phone_match:
        data["emergency_contact_phone"] = ec_phone_match.group(1)

    # Fallback: find all 10-digit numbers in text
    if not data["patient_phone"] or not data["emergency_contact_phone"]:
        all_phones = re.findall(r"\b([6-9]\d{9})\b", result_text)
        unique_phones = list(dict.fromkeys(all_phones))  # preserve order, remove duplicates
        if len(unique_phones) >= 2:
            if not data["patient_phone"]:
                data["patient_phone"] = unique_phones[0]
            if not data["emergency_contact_phone"]:
                data["emergency_contact_phone"] = unique_phones[1]
        elif len(unique_phones) == 1:
            if not data["emergency_contact_phone"]:
                data["emergency_contact_phone"] = unique_phones[0]

    # Emergency contact name
    ec_name_match = re.search(
        r"EMERGENCY CONTACT NAME:\s*([A-Za-z ]+?)(?:\s*[\n,]|$)",
        result_text, re.IGNORECASE
    )
    if ec_name_match:
        data["emergency_contact_name"] = ec_name_match.group(1).strip()

    # Emergency message
    emergency_match = re.search(
        r"EMERGENCY MESSAGE:\s*(.+?)(?:---END RESULT---|$)",
        result_text, re.DOTALL
    )
    if emergency_match:
        data["emergency_message"] = emergency_match.group(1).strip()

    # Recommended action (for patient SMS)
    action_match = re.search(
        r"RECOMMENDED ACTION:\s*(.+?)(?:AWARENESS TIPS|$)",
        result_text, re.DOTALL
    )
    if action_match:
        data["recommended_action"] = action_match.group(1).strip()

    # Follow-up days
    if "FOLLOW UP NEEDED: Yes - 3 days" in result_text:
        data["followup_days"] = 3
    elif "FOLLOW UP NEEDED: Yes - 7 days" in result_text:
        data["followup_days"] = 7

    # Symptoms
    symptoms_match = re.search(
        r"POSSIBLE CONDITIONS:\s*(.+?)(?:RECOMMENDED ACTION:|$)",
        result_text, re.DOTALL
    )
    if symptoms_match:
        data["symptoms"] = symptoms_match.group(1).strip()

    return data


def parse_mental_health_result(result_text: str) -> dict:
    """Extract patient details from mental health screening result."""
    data = {
        "patient_name": "Unknown",
        "patient_age": 0,
        "patient_gender": "Unknown",
        "symptoms": "Mental health screening",
        "followup_days": None,
    }

    patient_match = re.search(r"PATIENT:\s*(.+?),\s*(\d+)yr,\s*(.+)", result_text)
    if patient_match:
        data["patient_name"] = patient_match.group(1).strip()
        data["patient_age"] = int(patient_match.group(2).strip())
        data["patient_gender"] = patient_match.group(3).strip().split("\n")[0].strip()

    depression_match = re.search(r"DEPRESSION RISK:\s*(.+)", result_text)
    anxiety_match = re.search(r"ANXIETY RISK:\s*(.+)", result_text)
    if depression_match and anxiety_match:
        data["symptoms"] = (
            f"Depression: {depression_match.group(1).strip()}, "
            f"Anxiety: {anxiety_match.group(1).strip()}"
        )

    if "FOLLOW UP NEEDED: Yes - 3 days" in result_text:
        data["followup_days"] = 3
    elif "FOLLOW UP NEEDED: Yes - 7 days" in result_text:
        data["followup_days"] = 7

    return data

# ─────────────────────────────────────────────
# Auth Endpoints
# ─────────────────────────────────────────────

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    if not data:
        return jsonify({"detail": "Invalid request"}), 400
        
    user = create_user(
        username=data.get("username"),
        password=data.get("password"),
        full_name=data.get("full_name"),
        village=data.get("village"),
        phone=data.get("phone")
    )
    if not user:
        return jsonify({"detail": "Username already exists"}), 400
    return jsonify({"message": "Account created successfully! ✅"})

@app.route("/login", methods=["POST"])
def login():
    # FastAPI's OAuth2PasswordRequestForm sends data as form-urlencoded, not JSON
    # We will support both form data and JSON for flexibility
    if request.is_json:
        username = request.json.get("username")
        password = request.json.get("password")
    else:
        username = request.form.get("username")
        password = request.form.get("password")

    user = get_user(username)
    if not user or not verify_password(password, user["password"]):
        return jsonify({"detail": "Incorrect username or password ❌"}), 401
        
    token = create_access_token(data={"sub": user["username"]})
    return jsonify({
        "access_token": token,
        "token_type": "bearer",
        "full_name": user["full_name"],
        "village": user["village"]
    })

@app.route("/profile", methods=["GET"])
@token_required
def get_profile():
    return jsonify({
        "username": g.current_user["username"],
        "full_name": g.current_user["full_name"],
        "village": g.current_user["village"],
        "phone": g.current_user["phone"]
    })

# ─────────────────────────────────────────────
# Triage Chat
# ─────────────────────────────────────────────

@app.route("/chat/triage", methods=["POST"])
@token_required
def chat_triage():
    data = request.json
    language = data.get("language", "English")
    conversation_history = data.get("conversation_history", [])
    user_message = data.get("message", "")
    
    system_prompt = f"""
    You are a friendly AI health assistant helping rural community health workers in India.
    You are conducting a patient symptom triage through a chat conversation.
    Always respond in {language} language.
    Use very simple, clear language. Avoid complex medical terms.

    Your job is to collect the following information through natural conversation:
    1. Patient name
    2. Patient age
    3. Patient gender
    4. Patient phone number (10-digit Indian mobile number)
    5. Symptoms (ask follow-up questions if needed)
    6. Emergency contact name and phone number (a family member or neighbour)

    Once you have ALL this information, provide a complete triage assessment in this EXACT format:

    ---TRIAGE RESULT---
    PATIENT: [name], [age]yr, [gender]
    PATIENT PHONE: [10-digit number]
    SEVERITY: [Low / Medium / High / Emergency]

    WARNING SIGNS:
    [If High or Emergency severity, start with 🚨 WARNING]
    [List 3-4 warning signs]

    POSSIBLE CONDITIONS:
    [2-3 possibilities in simple terms]

    RECOMMENDED ACTION:
    [Step by step instructions]

    AWARENESS TIPS FOR PATIENT:
    [3-4 simple tips in {language}]

    FOLLOW UP NEEDED: [Yes - 3 days / Yes - 7 days / No]

    PATIENT SUMMARY:
    [2-3 line summary]

    EMERGENCY CONTACT NAME: [name]
    EMERGENCY CONTACT PHONE: [10-digit number]

    EMERGENCY MESSAGE:
    [Only if High or Emergency severity]
    [🚨 HEALTH ALERT: Your family member [name] ([age]yr [gender]) needs URGENT medical attention. Symptoms: [symptoms]. Please come immediately.]
    ---END RESULT---

    If you don't have all the information yet, ask for the missing details naturally.
    Be warm, friendly and reassuring in your tone.
    """

    contents = system_prompt + "\\n\\nConversation so far:\\n"
    for msg in conversation_history:
        role = "Health Worker" if msg["role"] == "user" else "Assistant"
        contents += f"{role}: {msg['content']}\\n"
    contents += f"Health Worker: {user_message}\\nAssistant:"

    response = client.generate_content(contents)
    result_text = response.text

    triage_saved = False
    patient_sms_sent = False
    emergency_sms_sent = False

    if "---TRIAGE RESULT---" in result_text:
        parsed = parse_triage_result(result_text)

        save_patient(
            health_worker_username=g.current_user["username"],
            patient_name=parsed["patient_name"],
            patient_age=parsed["patient_age"],
            patient_gender=parsed["patient_gender"],
            symptoms=parsed["symptoms"],
            language=language,
            triage_result=result_text,
            followup_days=parsed["followup_days"],
            emergency_contact_name=parsed.get("emergency_contact_name"),
            emergency_contact_phone=parsed.get("emergency_contact_phone")
        )
        triage_saved = True

        # SMS 1 — Send full result + recommended action to PATIENT
        if parsed.get("patient_phone"):
            patient_msg = (
                f"Health Update for {parsed['patient_name']}:\\n"
                f"Severity: {'🚨 HIGH' if parsed['is_emergency'] else 'Manageable'}\\n"
                f"Action: {parsed['recommended_action'] or 'Follow health worker advice.'}\\n"
                f"Follow up: {'Yes in ' + str(parsed['followup_days']) + ' days' if parsed['followup_days'] else 'Not needed'}"
            )
            patient_sms_sent = send_sms(
                phone=parsed["patient_phone"],
                message=patient_msg,
                label="Patient Result SMS"
            )

        # SMS 2 — Send emergency alert to EMERGENCY CONTACT (only if High/Emergency)
        if parsed["is_emergency"] and parsed.get("emergency_contact_phone") and parsed.get("emergency_message"):
            emergency_sms_sent = send_sms(
                phone=parsed["emergency_contact_phone"],
                message=parsed["emergency_message"],
                label="Emergency Contact SMS"
            )

    return jsonify({
        "response": result_text,
        "triage_completed": triage_saved,
        "patient_sms_sent": patient_sms_sent,
        "emergency_sms_sent": emergency_sms_sent
    })

# ─────────────────────────────────────────────
# Mental Health Chat
# ─────────────────────────────────────────────

@app.route("/chat/mental-health", methods=["POST"])
@token_required
def chat_mental_health():
    data = request.json
    language = data.get("language", "English")
    conversation_history = data.get("conversation_history", [])
    user_message = data.get("message", "")
    
    system_prompt = f"""
    You are a warm, compassionate AI assistant helping rural community health workers
    in India screen patients for mental health concerns.
    Always respond in {language} language.
    Use simple, gentle, non-judgmental language.
    You are NOT diagnosing — you are screening and guiding the health worker.

    First collect:
    1. Patient name
    2. Patient age
    3. Patient gender
    4. Emergency contact name and phone

    Then ask these 10 questions ONE AT A TIME in a warm conversational way.
    Each answer should be: Not at all / Several days / More than half the days / Nearly every day

    PHQ-5 Depression Questions:
    Q1: Over the last 2 weeks, how often has the patient had little interest or pleasure in doing things?
    Q2: How often have they been feeling down, depressed or hopeless?
    Q3: How often have they had trouble falling or staying asleep?
    Q4: How often have they felt tired or had little energy?
    Q5: How often have they felt bad about themselves or like a failure?

    GAD-5 Anxiety Questions:
    Q6: How often have they felt nervous, anxious or on edge?
    Q7: How often have they been unable to stop or control worrying?
    Q8: How often have they been worrying too much about different things?
    Q9: How often have they had trouble relaxing?
    Q10: How often have they felt afraid as if something awful might happen?

    Once you have ALL answers, provide assessment in this EXACT format:

    ---MENTAL HEALTH RESULT---
    PATIENT: [name], [age]yr, [gender]
    DEPRESSION RISK: [None / Mild / Moderate / Severe]
    ANXIETY RISK: [None / Mild / Moderate / Severe]

    OBSERVATIONS:
    [Simple caring observations. Never use words like diagnosed or disorder]

    ADVICE FOR HEALTH WORKER:
    [How to support this patient compassionately]
    [When to refer to a counselor]

    SUPPORT TIPS FOR PATIENT:
    [3-4 simple coping tips relevant to rural India]

    FOLLOW UP NEEDED: [Yes - 3 days / Yes - 7 days / No]

    EMERGENCY MESSAGE:
    [Only if Severe risk]
    [🚨 SUPPORT NEEDED: Your family member [name] is going through a difficult time emotionally and needs your love and support urgently. Please be with them and consider speaking to a doctor or counselor together.]
    ---END RESULT---
    """

    contents = system_prompt + "\\n\\nConversation so far:\\n"
    for msg in conversation_history:
        role = "Health Worker" if msg["role"] == "user" else "Assistant"
        contents += f"{role}: {msg['content']}\\n"
    contents += f"Health Worker: {user_message}\\nAssistant:"

    response = client.generate_content(contents)
    result_text = response.text
    screening_completed = "---MENTAL HEALTH RESULT---" in result_text

    if screening_completed:
        parsed = parse_mental_health_result(result_text)
        save_patient(
            health_worker_username=g.current_user["username"],
            patient_name=parsed["patient_name"],
            patient_age=parsed["patient_age"],
            patient_gender=parsed["patient_gender"],
            symptoms=parsed["symptoms"],
            language=language,
            triage_result=result_text,
            followup_days=parsed["followup_days"],
            emergency_contact_name=None,
            emergency_contact_phone=None
        )

    return jsonify({
        "response": result_text,
        "screening_completed": screening_completed
    })


# ─────────────────────────────────────────────
# Patient Records
# ─────────────────────────────────────────────

@app.route("/patients", methods=["GET"])
@token_required
def get_patients():
    patients = get_all_patients(g.current_user["username"])
    return jsonify({"patients": patients})

@app.route("/patients/<int:patient_id>", methods=["DELETE"])
@token_required
def remove_patient(patient_id):
    deleted = delete_patient(patient_id, g.current_user["username"])
    if not deleted:
        return jsonify({"detail": "Patient not found ❌"}), 404
    return jsonify({"message": "Patient record deleted ✅"})

@app.route("/followups", methods=["GET"])
@token_required
def get_followups():
    patients = get_patients_due_followup(g.current_user["username"])
    return jsonify({"followups_due": patients, "count": len(patients)})


# ─────────────────────────────────────────────
# Translation
# ─────────────────────────────────────────────

@app.route("/translate", methods=["POST"])
@token_required
def translate():
    data = request.json
    text = data.get("text")
    target_language = data.get("target_language")
    
    prompt = f"""
    Translate the following health assessment into {target_language}.
    Keep the exact same format and structure.
    Use simple words a rural health worker in India would understand.

    Text to translate:
    {text}
    """
    response = client.generate_content(prompt)
    return jsonify({"result": response.text})

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Rural Health Triage Chatbot API is running! 🏥"})

if __name__ == "__main__":
    app.run(debug=True, port=8000)
