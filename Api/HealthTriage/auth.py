import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from database import get_connection

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "rural_health_secret_key_2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(username: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None

def create_user(username, password, full_name, village, phone):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO users (username, password, full_name, village, phone)
            VALUES (?, ?, ?, ?, ?)
        """, (username, hash_password(password), full_name, village, phone))
        conn.commit()
        conn.close()
        return True
    except Exception:
        conn.close()
        return False

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"detail": "Could not validate credentials"}), 401
        
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            username: str = payload.get("sub")
            if username is None:
                return jsonify({"detail": "Could not validate credentials"}), 401
        except JWTError:
            return jsonify({"detail": "Could not validate credentials"}), 401
        
        user = get_user(username)
        if user is None:
            return jsonify({"detail": "Could not validate credentials"}), 401
            
        g.current_user = user
        return f(*args, **kwargs)
    return decorated
