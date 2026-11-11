import json
from pathlib import Path

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

create_tables()

# ---------------------------------------------------------
# Lesson content lives in content.json (lessons, quizzes, setup guides).
# The database only stores users and their progress.
# ---------------------------------------------------------
CONTENT_FILE = Path(__file__).parent / "content.json"
with open(CONTENT_FILE, encoding="utf-8") as f:
    CONTENT = json.load(f)

SETUP_GUIDES = CONTENT["setupGuides"]
MODULES = CONTENT["modules"]
LESSONS = {lesson["id"]: lesson for lesson in CONTENT["lessons"]}
QUESTIONS = CONTENT["questions"]  # keys are text, like "101"

PASS_MARK = 3  # correct answers needed out of 5


# ---------------- Request models ----------------
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class QuizRequest(BaseModel):
    answers: dict = {}


# ---------------- Helper functions ----------------
def load_progress(user_id):
    # Returns {lesson_id: {challenge_done, best_score, completed}} for this user
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT lesson_id, challenge_done, best_score, completed "
        "FROM lesson_progress WHERE user_id = ?",
        (user_id,),
    ).fetchall()
    conn.close()
    return {row["lesson_id"]: dict(row) for row in rows}


def is_lesson_completed(progress, lesson_id):
    return lesson_id in progress and progress[lesson_id]["completed"] == 1


def is_module_completed(progress, module):
    return all(is_lesson_completed(progress, lid) for lid in module["lesson_ids"])


def get_module_status(progress, index):
    # Module 1 is open. A module opens when the one before it is completed.
    module = MODULES[index]
    if is_module_completed(progress, module):
        return "completed"
    if index == 0 or is_module_completed(progress, MODULES[index - 1]):
        return "unlocked"
    return "locked"


def get_lesson_status(progress, lesson_id):
    if is_lesson_completed(progress, lesson_id):
        return "completed"

    # Find which module this lesson belongs to, and its position in it
    for index, module in enumerate(MODULES):
        if lesson_id in module["lesson_ids"]:
            if get_module_status(progress, index) == "locked":
                return "locked"
            position = module["lesson_ids"].index(lesson_id)
            if position == 0:
                return "unlocked"
            # Later lessons open when the lesson before them is completed
            previous_id = module["lesson_ids"][position - 1]
            if is_lesson_completed(progress, previous_id):
                return "unlocked"
            return "locked"
    return "locked"


def to_percent(raw_score, lesson_id):
    total = len(QUESTIONS.get(str(lesson_id), []))
    return round(raw_score * 100 / total) if total else 0


def get_open_lesson(lesson_id, user_id):
    # Stops with 404 if the lesson does not exist, 403 if it is locked
    if lesson_id not in LESSONS:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    progress = load_progress(user_id)
    if get_lesson_status(progress, lesson_id) == "locked":
        raise HTTPException(status_code=403, detail="This lesson is locked.")
    return LESSONS[lesson_id]


def find_module(module_id):
    for module in MODULES:
        if module["id"] == module_id:
            return module
    raise HTTPException(status_code=404, detail="Module not found.")


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
    return [
        {
            "id": g["id"],
            "title": g["title"],
            "difficulty": g["difficulty"],
            "description": g["description"],
        }
        for g in SETUP_GUIDES
    ]


@app.get("/setup-guides/{guide_id}")
def get_setup_guide(guide_id: str):
    for guide in SETUP_GUIDES:
        if guide["id"] == guide_id:
            return guide
    raise HTTPException(status_code=404, detail="Setup guide not found.")


# ---------------- Modules and lessons ----------------
@app.get("/modules")
def get_modules(current_user: dict = Depends(get_current_user)):
    progress = load_progress(current_user["id"])

    result = []
    for index, module in enumerate(MODULES):
        lessons = []
        raw_total = 0
        question_total = 0

        for lesson_id in module["lesson_ids"]:
            raw = progress.get(lesson_id, {}).get("best_score")  # None if no quiz yet
            raw_total += raw or 0
            question_total += len(QUESTIONS.get(str(lesson_id), []))
            lessons.append({
                "id": lesson_id,
                "title": LESSONS[lesson_id]["title"],
                "status": get_lesson_status(progress, lesson_id),
                "best_score": None if raw is None else to_percent(raw, lesson_id),
            })

        result.append({
            "id": module["id"],
            "title": module["title"],
            "description": module["description"],
            "status": get_module_status(progress, index),
            "best_score": raw_total,
            "total_questions": question_total,
            "lessons": lessons,
        })
    return result


@app.get("/lessons/{lesson_id}")
def get_lesson(lesson_id: int, current_user: dict = Depends(get_current_user)):
    return get_open_lesson(lesson_id, current_user["id"])


@app.post("/lessons/{lesson_id}/challenge-complete")
def complete_challenge(lesson_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    get_open_lesson(lesson_id, user_id)

    conn = get_db_connection()
    conn.execute(
        """INSERT INTO lesson_progress (user_id, lesson_id, challenge_done)
           VALUES (?, ?, 1)
           ON CONFLICT (user_id, lesson_id) DO UPDATE SET challenge_done = 1""",
        (user_id, lesson_id),
    )
    conn.commit()
    conn.close()
    return {"message": "Challenge completed successfully.", "completed": True}


# ---------------- Lesson quizzes ----------------
@app.get("/lessons/{lesson_id}/questions")
@app.get("/lessons/{lesson_id}/quiz")
def get_questions(lesson_id: int, current_user: dict = Depends(get_current_user)):
    get_open_lesson(lesson_id, current_user["id"])

    questions = QUESTIONS.get(str(lesson_id))
    if not questions:
        raise HTTPException(status_code=404, detail="Questions not found.")

    # Only send the question and options. The correct answer stays on the server.
    return [
        {"id": q["id"], "question": q["question"], "options": q["options"]}
        for q in questions
    ]


@app.post("/lessons/{lesson_id}/quiz")
@app.post("/lessons/{lesson_id}/quiz/submit")
def submit_quiz(
    lesson_id: int,
    data: QuizRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    get_open_lesson(lesson_id, user_id)

    questions = QUESTIONS.get(str(lesson_id))
    if not questions:
        raise HTTPException(status_code=404, detail="Quiz not found.")

    progress = load_progress(user_id)
    lesson_progress = progress.get(lesson_id, {})
    if not lesson_progress.get("challenge_done"):
        raise HTTPException(
            status_code=400,
            detail="Complete the lesson challenge before taking the quiz.",
        )

    # Mark the answers
    score = 0
    results = []
    for q in questions:
        selected = data.answers.get(str(q["id"]))
        try:
            selected = int(selected)
        except (TypeError, ValueError):
            selected = None

        is_correct = selected == q["correct_option"]
        if is_correct:
            score += 1

        results.append({
            "question_id": q["id"],
            "selected_option": selected,
            "correct_option": q["correct_option"],
            "is_correct": is_correct,
            "explanation": q["explanation"],
        })

    passed = score >= PASS_MARK

    # Keep only the best score. Once completed, a lesson stays completed.
    best = max(lesson_progress.get("best_score") or 0, score)
    completed = 1 if (passed or lesson_progress.get("completed") == 1) else 0

    conn = get_db_connection()
    conn.execute(
        "UPDATE lesson_progress SET best_score = ?, completed = ? "
        "WHERE user_id = ? AND lesson_id = ?",
        (best, completed, user_id, lesson_id),
    )
    conn.commit()
    conn.close()

    return {"score": score, "total": len(questions), "passed": passed, "results": results}


# ---------------- Module and final assessments (placeholders) ----------------
@app.get("/modules/{module_id}/assessment/questions")
def get_assessment_questions(module_id: int, current_user: dict = Depends(get_current_user)):
    module = find_module(module_id)
    progress = load_progress(current_user["id"])
    if not is_module_completed(progress, module):
        raise HTTPException(status_code=403, detail="Complete all lessons first.")
    return [{
        "id": 1,
        "question": "Which topic did this module teach you?",
        "options": [
            "A topic from this module",
            "A topic from another course",
            "None of these",
            "All commands are identical",
        ],
    }]


@app.post("/modules/{module_id}/assessment")
def submit_assessment(module_id: int, current_user: dict = Depends(get_current_user)):
    module = find_module(module_id)
    progress = load_progress(current_user["id"])
    if not is_module_completed(progress, module):
        raise HTTPException(status_code=403, detail="Complete all lessons first.")
    return {"passed": True, "score": 1, "total": 1, "message": "Module assessment completed."}


@app.get("/final-assessment")
def get_final_assessment(current_user: dict = Depends(get_current_user)):
    progress = load_progress(current_user["id"])
    if not all(is_module_completed(progress, m) for m in MODULES):
        raise HTTPException(status_code=403, detail="Complete all modules first.")
    return {
        "title": "Linux Workspace Challenge",
        "instructions": "Create and organize a project workspace using the commands learned throughout the course.",
    }


@app.post("/final-assessment/submit")
def submit_final_assessment(current_user: dict = Depends(get_current_user)):
    progress = load_progress(current_user["id"])
    if not all(is_module_completed(progress, m) for m in MODULES):
        raise HTTPException(status_code=403, detail="Complete all modules first.")
    return {"completed": True, "message": "Final assessment submitted."}


# ---------------- Progress ----------------
@app.get("/progress")
def get_progress(current_user: dict = Depends(get_current_user)):
    progress = load_progress(current_user["id"])

    all_ids = [lid for module in MODULES for lid in module["lesson_ids"]]
    completed_ids = [lid for lid in all_ids if is_lesson_completed(progress, lid)]
        # Lesson ids whose practice challenge is finished
    challenge_completed = [
        lid for lid in all_ids
        if progress.get(lid, {}).get("challenge_done") == 1
    ]

    best_scores = {}   # {"101": 80}  (percentages)
    total_score = 0
    for lid in all_ids:
        raw = progress.get(lid, {}).get("best_score")
        if raw is not None:
            best_scores[str(lid)] = to_percent(raw, lid)
            total_score += raw

    # The first lesson that is open but not finished
    continue_id = None
    for lid in all_ids:
        if get_lesson_status(progress, lid) == "unlocked":
            continue_id = lid
            break

    percentage = round(len(completed_ids) * 100 / len(all_ids)) if all_ids else 0

    return {
        "name": current_user["name"],
        "completed_lessons": completed_ids,
        "total_lessons": len(all_ids),
        "completed_modules": sum(1 for m in MODULES if is_module_completed(progress, m)),
        "total_modules": len(MODULES),
        "percentage": percentage,
        "best_scores": best_scores,
        "total_score": total_score,
        "continue_lesson_id": continue_id,
        "challenge_completed": challenge_completed,
    }