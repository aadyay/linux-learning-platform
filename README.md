# LinuxLearn 🐧

An interactive Linux learning platform designed to help beginners understand Linux commands and concepts through structured lessons, hands-on terminal practice, quizzes, and progress tracking.

## Features

- **User Authentication:** Sign up and log in to access the learning platform.
- **Interactive Dashboard:** View learning modules, lesson status, and overall progress.
- **Structured Lessons:** Learn Linux concepts through organized lessons.
- **Simulated Linux Terminal:** Practice Linux commands in an interactive terminal environment.
- **Interactive Quizzes:** Test your understanding with multiple-choice questions.
- **Quiz Review:** View scores, correct answers, and explanations.
- **Progress Tracking:** Track completed lessons, quiz scores, and learning progress.

## Tech Stack

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Python
- FastAPI
- Uvicorn

**Database**
- SQLite

## Project Structure

```text
linux-learning-platform/
│
├── backend/
│   ├── auth.py
│   ├── content.json
│   ├── database.py
│   ├── linux_learning.db
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── lesson.js
│   │   ├── quiz.js
│   │   └── terminal.js
│   │
│   ├── dashboard.html
│   ├── index.html
│   ├── lesson.html
│   ├── login.html
│   ├── quiz.html
│   └── signup.html
│
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:
- Python
- Git
- A modern web browser

### 1. Clone the Repository

```bash
git clone https://github.com/aadyay/linux-learning-platform.git
```

Navigate to the project directory:

```bash
cd linux-learning-platform
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
python -m uvicorn main:app --reload
```

The backend will run at:

`http://127.0.0.1:8000`

API documentation is available at:

`http://127.0.0.1:8000/docs`

### 3. Start the Frontend

Open a **second terminal** and navigate to the project root:

```bash
cd linux-learning-platform
```

Start the frontend server:

```bash
python -m http.server 5500
```

Open the application in your browser:

`http://localhost:5500/frontend/`

Make sure both the backend and frontend servers are running while using the application.

## Application Pages

| Page | Purpose |
|---|---|
| `index.html` | Landing page |
| `signup.html` | User registration |
| `login.html` | User login |
| `dashboard.html` | Learning dashboard and progress |
| `lesson.html` | Interactive lessons and challenges |
| `quiz.html` | Lesson quizzes and result review |

## How It Works

1. Create an account or log in.
2. Explore the available Linux learning modules.
3. Complete lessons and practice commands using the simulated terminal.
4. Complete lesson challenges to unlock quizzes.
5. Attempt quizzes and review your results.
6. Track your learning progress through the dashboard.

## Note

The interactive terminal simulates Linux command execution within the application. It does not execute commands directly on the user's operating system.

---

**LinuxLearn** — Learn Linux, one command at a time. 🐧