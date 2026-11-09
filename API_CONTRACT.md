# Linux Learning Platform — API Contract

Version: 2.0

## 1. General Information

- Backend base URL: `http://localhost:8000`
- Frontend: HTML, CSS and JavaScript
- Data format: JSON
- Authentication: Bearer Token
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

### GET /modules

Returns all modules and their lessons.

Response:
```json
[
  {
    "id": 1,
    "title": "Linux Fundamentals",
    "description": "Understand Linux and essential commands.",
    "status": "unlocked",
    "lessons": [
