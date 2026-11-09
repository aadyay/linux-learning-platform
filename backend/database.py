import sqlite3

# The name of the file where all our data will be saved
DATABASE_FILE = "linux_learning.db"


def get_db_connection():
    # Open the database file
    conn = sqlite3.connect(DATABASE_FILE)
    # This lets us read a row by column name, like row["email"]
    conn.row_factory = sqlite3.Row
    # Make SQLite respect links between tables
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def create_tables():
    conn = get_db_connection()

    # Table 1: one row per person who signs up
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    """)

    # Table 2: remembers who is logged in (one row per token)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Table 3: the lessons (steps are saved as JSON text)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module_number INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            mission TEXT,
            steps_json TEXT NOT NULL
        )
    """)

    # Table 4: the quiz questions of each lesson
    conn.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_option TEXT NOT NULL,
            explanation TEXT,
            FOREIGN KEY (lesson_id) REFERENCES lessons (id)
        )
    """)

    # Table 5: what each user has finished
    conn.execute("""
        CREATE TABLE IF NOT EXISTS progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            lesson_id INTEGER NOT NULL,
            challenge_done INTEGER DEFAULT 0,
            quiz_score INTEGER,
            passed INTEGER DEFAULT 0,
            UNIQUE (user_id, lesson_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (lesson_id) REFERENCES lessons (id)
        )
    """)

    # Save the changes and close the database
    conn.commit()
    conn.close()