import sqlite3
from datetime import datetime, timedelta


def get_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            village TEXT NOT NULL,
            phone TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            health_worker_username TEXT NOT NULL,
            patient_name TEXT NOT NULL,
            patient_age INTEGER NOT NULL,
            patient_gender TEXT NOT NULL,
            symptoms TEXT NOT NULL,
            language TEXT DEFAULT 'English',
            triage_result TEXT,
            followup_days INTEGER,
            followup_date TEXT,
            emergency_contact_name TEXT,
            emergency_contact_phone TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


def save_patient(
    health_worker_username,
    patient_name,
    patient_age,
    patient_gender,
    symptoms,
    language,
    triage_result,
    followup_days,
    emergency_contact_name=None,
    emergency_contact_phone=None
):
    conn = get_connection()
    cursor = conn.cursor()

    followup_date = None
    if followup_days:
        followup_date = (
            datetime.now() + timedelta(days=followup_days)
        ).strftime("%Y-%m-%d")

    cursor.execute("""
        INSERT INTO patients (
            health_worker_username,
            patient_name,
            patient_age,
            patient_gender,
            symptoms,
            language,
            triage_result,
            followup_days,
            followup_date,
            emergency_contact_name,
            emergency_contact_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        health_worker_username,
        patient_name,
        patient_age,
        patient_gender,
        symptoms,
        language,
        triage_result,
        followup_days,
        followup_date,
        emergency_contact_name,
        emergency_contact_phone
    ))

    conn.commit()
    conn.close()


def get_all_patients(health_worker_username):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM patients
        WHERE health_worker_username = ?
        ORDER BY created_at DESC
    """, (health_worker_username,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_patients_due_followup(health_worker_username):
    conn = get_connection()
    cursor = conn.cursor()

    today = datetime.now().strftime("%Y-%m-%d")

    cursor.execute("""
        SELECT * FROM patients
        WHERE health_worker_username = ?
        AND followup_date <= ?
        AND followup_date IS NOT NULL
        ORDER BY followup_date ASC
    """, (health_worker_username, today))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def search_patients(health_worker_username, query):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM patients
        WHERE health_worker_username = ?
        AND (
            patient_name LIKE ? OR
            symptoms LIKE ? OR
            patient_gender LIKE ?
        )
        ORDER BY created_at DESC
    """, (health_worker_username, f"%{query}%", f"%{query}%", f"%{query}%"))

    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def delete_patient(patient_id, health_worker_username):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM patients
        WHERE id = ? AND health_worker_username = ?
    """, (patient_id, health_worker_username))

    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()

    return deleted
