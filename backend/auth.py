import hashlib
import os
import secrets
from fastapi import Header, HTTPException
from database import get_db_connection


def hash_password(password):
    # A salt is a random value added to the password before scrambling,
    # so two people with the same password get different results
    salt = os.urandom(16)
    scrambled = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    # Save both together as text: "salt:hash"
    return salt.hex() + ":" + scrambled.hex()


def verify_password(password, saved_value):
    # Split the saved "salt:hash" back into its two parts
    salt_hex, hash_hex = saved_value.split(":")
    salt = bytes.fromhex(salt_hex)
    # Scramble the typed password with the SAME salt and compare
    scrambled = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return secrets.compare_digest(scrambled.hex(), hash_hex)


def create_token(user_id):
    # Make a long random code and save it as this user's "entry pass"
    token = secrets.token_hex(32)
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO sessions (token, user_id) VALUES (?, ?)",
        (token, user_id),
    )
    conn.commit()
    conn.close()
    return token


def get_current_user(authorization: str = Header(None)):
    # The browser sends:  Authorization: Bearer <token>
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Please log in first")

    token = authorization.split(" ", 1)[1]

    # Find the user who owns this token
    conn = get_db_connection()
    user = conn.execute(
        """SELECT users.id, users.name, users.email
           FROM sessions
           JOIN users ON users.id = sessions.user_id
           WHERE sessions.token = ?""",
        (token,),
    ).fetchone()
    conn.close()

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid login. Please log in again")

    return dict(user)