import json
from typing import List

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import create_tables, get_db_connection
from auth import hash_password, verify_password, create_token, get_current_user
from seed_data import seed_database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Make the tables and fill them with lessons when the app starts
create_tables()
seed_database()

PASS_MARK = 70

# Commands we know. Used to say "command not found" for typos.
KNOWN_COMMANDS = {
    "pwd", "whoami", "date", "uname", "history", "ls", "cd", "clear",
    "mkdir", "touch", "cp", "mv", "rm", "rmdir",
    "cat", "head", "tail", "find", "echo",
}


# ---------------- Request models ----------------
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class CommandRequest(BaseModel):
    command: str


class AnswerItem(BaseModel):
    question_id: int
    selected: str


class QuizSubmitRequest(BaseModel):
    answers: List[AnswerItem]


# ---------------- Helper functions ----------------
def get_module_statuses(conn, user_id):
    # Module 1 is always unlocked. A module unlocks when the one before it is passed.
    modules = conn.execute("SELECT id FROM modules ORDER BY position").fetchall()
    passed_rows = conn.execute(
        "SELECT module_id FROM module_progress WHERE user_id = ? AND passed = 1",
        (user_id,),
    ).fetchall()
    passed = {row["module_id"] for row in passed_rows}

    statuses = {}
    previous_passed = True
    for module in modules:
        if module["id"] in passed:
            statuses[module["id"]] = "completed"
        elif previous_passed:
            statuses[module["id"]] = "unlocked"
        else:
            statuses[module["id"]] = "locked"
        previous_passed = module["id"] in passed
    return statuses


def check_module_open(conn, module_id, user_id):
    # Stops with 404 if the module does not exist, 403 if it is locked
    statuses = get_module_statuses(conn, user_id)
    if module_id not in statuses:
        conn.close()
        raise HTTPException(status_code=404, detail="Module not found")
    if statuses[module_id] == "locked":
        conn.close()
        raise HTTPException(status_code=403, detail="This module is locked")


def get_open_lesson(conn, lesson_id, user_id):
    lesson = conn.execute("SELECT * FROM lessons WHERE id = ?", (lesson_id,)).fetchone()
    if lesson is None:
        conn.close()
        raise HTTPException(status_code=404, detail="Lesson not found")
    check_module_open(conn, lesson["module_id"], user_id)
    return lesson


def clean_command(text):
    # Remove extra spaces so "ls   -l" equals "ls -l"
    return " ".join(text.strip().split())


# ---------------- Auth ----------------
@app.post("/auth/signup")
def signup(data: SignupRequest):
    name = data.name.strip()
    email = data.email.strip().lower()

    if not name or not email or not data.password:
        raise HTTPException(status_code=400, detail="Please fill in all fields")
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Please enter a valid email")
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    conn = get_db_connection()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="This email is already registered")

    conn.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        (name, email, hash_password(data.password)),
    )
    conn.commit()
    conn.close()

    return {"message": "Account created successfully"}


@app.post("/auth/login")
def login(data: LoginRequest):
    email = data.email.strip().lower()

    conn = get_db_connection()
    user = conn.execute(
        "SELECT id, name, password_hash FROM users WHERE email = ?", (email,)
    ).fetchone()
    conn.close()

    if user is None or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Wrong email or password")

    token = create_token(user["id"])
    return {"token": token, "name": user["name"]}


# ---------------- Setup guides (public) ----------------
@app.get("/setup-guides")
def list_setup_guides():
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT id, title, difficulty FROM setup_guides ORDER BY rowid"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


@app.get("/setup-guides/{guide_id}")
def get_setup_guide(guide_id: str):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM setup_guides WHERE id = ?", (guide_id,)).fetchone()
    conn.close()

    if row is None:
        raise HTTPException(status_code=404, detail="Guide not found")

    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "steps": json.loads(row["steps_json"]),
    }


# ---------------- Modules and lessons ----------------
@app.get("/modules")
def get_modules(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db_connection()

    statuses = get_module_statuses(conn, user_id)
    done_rows = conn.execute(
        "SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND completed = 1",
        (user_id,),
    ).fetchall()
    done = {row["lesson_id"] for row in done_rows}

    modules = conn.execute(
        "SELECT id, title, description FROM modules ORDER BY position"
    ).fetchall()

    result = []
    for module in modules:
        status = statuses[module["id"]]
        lessons = []
        # Locked modules send an empty lessons list
        if status != "locked":
            lesson_rows = conn.execute(
                "SELECT id, title, type FROM lessons WHERE module_id = ? ORDER BY position",
                (module["id"],),
            ).fetchall()
            for lesson in lesson_rows:
                lessons.append({
                    "id": lesson["id"],
                    "title": lesson["title"],
                    "type": lesson["type"],
                    "completed": lesson["id"] in done,
                })
        result.append({
            "id": module["id"],
            "title": module["title"],
            "description": module["description"],
            "status": status,
            "lessons": lessons,
        })

    conn.close()
    return result


@app.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    lesson = get_open_lesson(conn, lesson_id, current_user["id"])

    # The expected command is NOT selected here, so the frontend never sees it
    steps = conn.execute(
        "SELECT step_number, instruction, hint FROM steps WHERE lesson_id = ? ORDER BY step_number",
        (lesson_id,),
    ).fetchall()
    conn.close()

    result = {
        "id": lesson["id"],
        "module_id": lesson["module_id"],
        "title": lesson["title"],
        "type": lesson["type"],
        "content": json.loads(lesson["content_json"]),
        "steps": [dict(step) for step in steps],
    }
    if lesson["type"] == "interactive":
        result["mission"] = lesson["mission"]
    return result


@app.post("/lessons/{lesson_id}/steps/{step_number}/check")
def check_step(
    lesson_id: int,
    step_number: int,
    data: CommandRequest,
    current_user: dict = Depends(get_current_user),
):
    conn = get_db_connection()
    get_open_lesson(conn, lesson_id, current_user["id"])

    step = conn.execute(
        "SELECT expected_command, output, feedback FROM steps WHERE lesson_id = ? AND step_number = ?",
        (lesson_id, step_number),
    ).fetchone()
    conn.close()

    if step is None:
        raise HTTPException(status_code=404, detail="Step not found")

    typed = clean_command(data.command)
    accepted = [clean_command(c) for c in step["expected_command"].split("|")]

    if typed in accepted:
        return {"correct": True, "output": step["output"], "feedback": step["feedback"]}

    first_word = typed.split(" ")[0] if typed else ""
    if first_word and first_word not in KNOWN_COMMANDS:
        output = "bash: " + first_word + ": command not found"
    else:
        output = ""
    return {
        "correct": False,
        "output": output,
        "feedback": "Not quite. Check the command and try again.",
    }


@app.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    get_open_lesson(conn, lesson_id, current_user["id"])

    conn.execute(
        "INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id, completed) VALUES (?, ?, 1)",
        (current_user["id"], lesson_id),
    )
    conn.commit()
    conn.close()
    return {"message": "Lesson completed"}


# ---------------- Quizzes ----------------
@app.get("/modules/{module_id}/quiz")
def get_quiz(module_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    check_module_open(conn, module_id, current_user["id"])

    # The correct option is NOT selected here
    rows = conn.execute(
        "SELECT id, question, option_a, option_b, option_c, option_d FROM questions WHERE module_id = ? ORDER BY id",
        (module_id,),
    ).fetchall()
    conn.close()

    if not rows:
        raise HTTPException(status_code=404, detail="This module has no quiz yet")

    questions = []
    for row in rows:
        questions.append({
            "id": row["id"],
            "question": row["question"],
            "options": {
                "a": row["option_a"],
                "b": row["option_b"],
                "c": row["option_c"],
                "d": row["option_d"],
            },
        })
    return {"module_id": module_id, "pass_mark": PASS_MARK, "questions": questions}


@app.post("/modules/{module_id}/quiz/submit")
def submit_quiz(
    module_id: int,
    data: QuizSubmitRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    conn = get_db_connection()
    check_module_open(conn, module_id, user_id)

    questions = conn.execute(
        "SELECT id, correct_option, explanation FROM questions WHERE module_id = ? ORDER BY id",
        (module_id,),
    ).fetchall()
    if not questions:
        conn.close()
        raise HTTPException(status_code=404, detail="This module has no quiz yet")

    given = {a.question_id: a.selected.strip().lower() for a in data.answers}

    results = []
    correct_count = 0
    for q in questions:
        is_correct = given.get(q["id"]) == q["correct_option"]
        if is_correct:
            correct_count += 1
        results.append({
            "question_id": q["id"],
            "correct": is_correct,
            "correct_option": q["correct_option"],
            "explanation": q["explanation"],
        })

    score = round(correct_count * 100 / len(questions))
    passed = score >= PASS_MARK
    next_module_unlocked = False

    if passed:
        conn.execute(
            """INSERT INTO module_progress (user_id, module_id, score, passed)
               VALUES (?, ?, ?, 1)
               ON CONFLICT (user_id, module_id) DO UPDATE SET score = excluded.score, passed = 1""",
            (user_id, module_id, score),
        )
        conn.commit()
        next_module = conn.execute(
            """SELECT id FROM modules
               WHERE position > (SELECT position FROM modules WHERE id = ?)
               ORDER BY position LIMIT 1""",
            (module_id,),
        ).fetchone()
        next_module_unlocked = next_module is not None

    conn.close()
    return {
        "score": score,
        "passed": passed,
        "next_module_unlocked": next_module_unlocked,
        "results": results,
    }


# ---------------- Progress ----------------
@app.get("/progress")
def get_progress(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db_connection()

    total_lessons = conn.execute("SELECT COUNT(*) FROM lessons").fetchone()[0]
    total_modules = conn.execute("SELECT COUNT(*) FROM modules").fetchone()[0]
    completed_lessons = conn.execute(
        "SELECT COUNT(*) FROM lesson_progress WHERE user_id = ? AND completed = 1", (user_id,)
    ).fetchone()[0]
    completed_modules = conn.execute(
        "SELECT COUNT(*) FROM module_progress WHERE user_id = ? AND passed = 1", (user_id,)
    ).fetchone()[0]
    conn.close()

    percentage = round(completed_lessons * 100 / total_lessons) if total_lessons else 0
    return {
        "name": current_user["name"],
        "completed_lessons": completed_lessons,
        "total_lessons": total_lessons,
        "completed_modules": completed_modules,
        "total_modules": total_modules,
        "percentage": percentage,
    }