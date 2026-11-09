import sqlite3

DATABASE_FILE = "linux_learning.db"


def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def create_tables():
    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # Installation guides (wsl, virtualbox, dual-boot). Steps are saved as JSON text.
    conn.execute("""
        CREATE TABLE IF NOT EXISTS setup_guides (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            description TEXT,
            steps_json TEXT NOT NULL
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS modules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            position INTEGER NOT NULL
        )
    """)

    # type is "reading" or "interactive". content_json holds the lesson text.
    conn.execute("""
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            content_json TEXT NOT NULL,
            mission TEXT,
            position INTEGER NOT NULL,
            FOREIGN KEY (module_id) REFERENCES modules (id)
        )
    """)

    # Practice terminal steps. expected_command is NEVER sent to the frontend.
    conn.execute("""
        CREATE TABLE IF NOT EXISTS steps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lesson_id INTEGER NOT NULL,
            step_number INTEGER NOT NULL,
            instruction TEXT NOT NULL,
            hint TEXT,
            expected_command TEXT NOT NULL,
            output TEXT,
            feedback TEXT,
            UNIQUE (lesson_id, step_number),
            FOREIGN KEY (lesson_id) REFERENCES lessons (id)
        )
    """)

    # One quiz per module
    conn.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            module_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            option_a TEXT NOT NULL,
            option_b TEXT NOT NULL,
            option_c TEXT NOT NULL,
            option_d TEXT NOT NULL,
            correct_option TEXT NOT NULL,
            explanation TEXT,
            FOREIGN KEY (module_id) REFERENCES modules (id)
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS lesson_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            lesson_id INTEGER NOT NULL,
            completed INTEGER DEFAULT 0,
            UNIQUE (user_id, lesson_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (lesson_id) REFERENCES lessons (id)
        )
    """)

    # A row here with passed = 1 means the module quiz was passed
    conn.execute("""
        CREATE TABLE IF NOT EXISTS module_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            module_id INTEGER NOT NULL,
            score INTEGER,
            passed INTEGER DEFAULT 0,
            UNIQUE (user_id, module_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (module_id) REFERENCES modules (id)
        )
    """)

    conn.commit()
    conn.close()