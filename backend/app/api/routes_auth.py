import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.core.database import get_db, hash_password

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Researcher"
    institution: Optional[str] = "Academic Institute"

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register")
async def register(payload: RegisterRequest):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE email = ?", (payload.email.strip().lower(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user_id = str(uuid.uuid4())
    pw_hash = hash_password(payload.password)

    cursor.execute("""
        INSERT INTO users (id, name, email, password_hash, role, institution)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, payload.name.strip(), payload.email.strip().lower(), pw_hash, payload.role, payload.institution))

    conn.commit()
    conn.close()

    return {
        "user": {
            "id": user_id,
            "name": payload.name.strip(),
            "email": payload.email.strip().lower(),
            "role": payload.role,
            "institution": payload.institution
        },
        "token": f"session-{user_id}"
    }

@router.post("/login")
async def login(payload: LoginRequest):
    conn = get_db()
    cursor = conn.cursor()

    email_clean = payload.email.strip().lower()
    pw_hash = hash_password(payload.password)

    cursor.execute("SELECT id, name, email, role, institution, password_hash FROM users WHERE email = ?", (email_clean,))
    user = cursor.fetchone()
    conn.close()

    if not user or user["password_hash"] != pw_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "institution": user["institution"]
        },
        "token": f"session-{user['id']}"
    }

@router.get("/me")
async def get_current_user():
    # Returns default demo user or active session
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, institution FROM users LIMIT 1")
    user = cursor.fetchone()
    conn.close()
    if user:
        return {"user": dict(user)}
    return {"user": None}

