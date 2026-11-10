import sqlite3

# The file where users and their progress are saved
DATABASE_FILE = "linux_learning.db"


def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    # Lets us read a row by column name, like row["email"]
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def create_tables():
    conn = get_db_connection()

    # One row per person who signs up
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    """)

    # Remembers who is logged in (one row per token)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # One row per user per lesson: challenge done? best quiz score? completed?
    conn.execute("""
        CREATE TABLE IF NOT EXISTS lesson_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            lesson_id INTEGER NOT NULL,
            challenge_done INTEGER DEFAULT 0,
            best_score INTEGER,
            completed INTEGER DEFAULT 0,
            UNIQUE (user_id, lesson_id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    conn.commit()
    conn.close()