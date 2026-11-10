# Linux Learning Platform — API Contract

Version: 2.1

## 1. General Information

- Backend base URL: `http://localhost:8000`
- Frontend: HTML, CSS and JavaScript
- Data format: JSON
- Authentication: Bearer Token (header: `Authorization: Bearer <token>`)
- Sections 2 and 3 are public. Sections 4, 5 and 6 need the token.
- Errors always look like `{"detail": "message"}` with status 400, 401, 403 or 404.
- Frontend will initially use mock data.

## 2. Authentication

### POST /auth/signup

Request:
```json
{
  "name": "Diya",
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Account created successfully"
}
```

### POST /auth/login

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "authentication_token",
  "name": "Diya"
}
```

## 3. Linux Setup Guides

### GET /setup-guides

Returns available Linux installation methods.

Response:
```json
[
  {
    "id": "wsl",
    "title": "Install Ubuntu using WSL",
    "difficulty": "Beginner"
  },
  {
    "id": "virtualbox",
    "title": "Install Ubuntu using VirtualBox",
    "difficulty": "Intermediate"
  },
  {
    "id": "dual-boot",
    "title": "Install Linux using Dual Boot",
    "difficulty": "Advanced"
  }
]
```

### GET /setup-guides/{id}

Returns the complete installation guide.

Response:
```json
{
  "id": "wsl",
  "title": "Install Ubuntu using WSL",
  "description": "Run Ubuntu inside Windows.",
  "steps": [
    {
      "step_number": 1,
      "heading": "Open PowerShell",
      "instructions": "Open PowerShell as Administrator.",
      "warning": null
    }
  ]
}
```

## 4. Modules and Lessons

Module `status` values: `"completed"`, `"unlocked"`, `"locked"`.
Lesson `type` values: `"reading"`, `"interactive"`.
Unlock rule: Module 1 is unlocked for every new user. Passing a module's quiz unlocks the next module.

### GET /modules

Returns all modules and their lessons. A locked module has an empty `lessons` list.

Response:
```json
[
  {
    "id": 1,
    "title": "Linux Fundamentals",
    "description": "Understand Linux and essential commands.",
    "status": "unlocked",
    "lessons": [
      {
        "id": 1,
        "title": "Understanding the Linux Environment",
        "type": "reading",
        "completed": true
      },
      {
        "id": 3,
        "title": "Exploring the System",
        "type": "interactive",
        "completed": false
      }
    ]
  },
  {
    "id": 2,
    "title": "Linux File System",
    "description": "Learn the directory structure and file commands.",
    "status": "locked",
    "lessons": []
  }
]
```

### GET /lessons/{lesson_id}

Returns one lesson. Returns 403 `{"detail": "This module is locked"}` if its module is locked.

Response (reading lesson):
```json
{
  "id": 1,
  "module_id": 1,
  "title": "Understanding the Linux Environment",
  "type": "reading",
  "content": [
    { "heading": "What is the kernel?", "text": "The kernel is the core of Linux..." }
  ],
  "steps": []
}
```

Response (interactive lesson):
```json
{
  "id": 3,
  "module_id": 1,
  "title": "Exploring the System",
  "type": "interactive",
  "content": [
    { "heading": "Commands in this lesson", "text": "pwd, whoami, date, uname, history" }
  ],
  "mission": "Find out who you are and where you are.",
  "steps": [
    {
      "step_number": 1,
      "instruction": "Type the command that prints your current directory.",
      "hint": "It stands for 'print working directory'."
    }
  ]
}
```

The correct command is NOT sent to the frontend. The backend checks it.

### POST /lessons/{lesson_id}/steps/{step_number}/check

Checks the command the user typed in the practice terminal.

Request:
```json
{ "command": "pwd" }
```

Response (correct):
```json
{
  "correct": true,
  "output": "/home/student",
  "feedback": "Correct! pwd shows the folder you are in."
}
```

Response (wrong):
```json
{
  "correct": false,
  "output": "bash: pw: command not found",
  "feedback": "Not quite. Check the spelling and try again."
}
```

### POST /lessons/{lesson_id}/complete

Marks the lesson as completed for this user.

Response:
```json
{ "message": "Lesson completed" }
```

## 5. Quizzes (one quiz per module)

### GET /modules/{module_id}/quiz

Returns the quiz questions WITHOUT the correct answers. Returns 403 if the module is locked.

Response:
```json
{
  "module_id": 1,
  "pass_mark": 70,
  "questions": [
    {
      "id": 1,
      "question": "Which command shows your current directory?",
      "options": { "a": "ls", "b": "pwd", "c": "cd", "d": "date" }
    }
  ]
}
```

### POST /modules/{module_id}/quiz/submit

Request:
```json
{
  "answers": [
    { "question_id": 1, "selected": "b" }
  ]
}
```

Response:
```json
{
  "score": 80,
  "passed": true,
  "next_module_unlocked": true,
  "results": [
    {
      "question_id": 1,
      "correct": true,
      "correct_option": "b",
      "explanation": "pwd means print working directory."
    }
  ]
}
```

`score` is a percentage (0-100). `passed` is true when `score` is at least `pass_mark`.

## 6. Progress

### GET /progress

Response:
```json
{
  "name": "Diya",
  "completed_lessons": 5,
  "total_lessons": 11,
  "completed_modules": 1,
  "total_modules": 3,
  "percentage": 45
}
```

## 7. Open Questions

1. Getting Started has 4 lessons in CURRICULUM.md but only 3 install guides here. Should Getting Started stay outside /modules as read-only guides?
2. Should Module 3 show as locked with no content for now?
3. Is one quiz per module correct?
4. Should locked modules still list their lesson titles (with a locked flag), or stay empty as now?