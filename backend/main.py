from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import create_tables, get_db_connection
from auth import hash_password, verify_password, create_token, get_current_user

app = FastAPI()

# Allow the frontend page to call this backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Make the tables when the app starts
create_tables()


# ---- What the frontend must send (Pydantic checks these automatically) ----
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# ---- Signup ----
@app.post("/auth/signup")
def signup(data: SignupRequest):
    name = data.name.strip()
    email = data.email.strip().lower()

    # Basic checks
    if not name or not email or not data.password:
        raise HTTPException(status_code=400, detail="Please fill in all fields")
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    conn = get_db_connection()

    # Is this email already used?
    existing = conn.execute(
        "SELECT id FROM users WHERE email = ?", (email,)
    ).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="This email is already registered")

    # Save the new user with a hashed password
    conn.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        (name, email, hash_password(data.password)),
    )
    conn.commit()
    conn.close()

    return {"message": "Account created successfully"}


# ---- Login ----
@app.post("/auth/login")
def login(data: LoginRequest):
    email = data.email.strip().lower()

    conn = get_db_connection()
    user = conn.execute(
        "SELECT id, name, password_hash FROM users WHERE email = ?", (email,)
    ).fetchone()
    conn.close()

    # Same message for "no such email" and "wrong password", on purpose
    if user is None or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Wrong email or password")

    token = create_token(user["id"])
    return {"token": token, "name": user["name"]}


# ---- TEMPORARY: to test that tokens work. We will delete this later. ----
@app.get("/test-token")
def test_token(current_user: dict = Depends(get_current_user)):
        return {"message": "You are logged in", "user": current_user}