import json
from database import get_db_connection

SETUP_GUIDES = [
    {
        "id": "wsl",
        "title": "Install Ubuntu using WSL",
        "difficulty": "Beginner",
        "description": "Run Ubuntu inside Windows.",
        "steps": [
            {"step_number": 1, "heading": "Open PowerShell as Administrator",
             "instructions": "Click Start, type PowerShell, right-click Windows PowerShell and choose Run as administrator.",
             "warning": None},
            {"step_number": 2, "heading": "Install WSL",
             "instructions": "Type wsl --install and press Enter. This installs WSL and Ubuntu.",
             "warning": "You need Windows 10 (version 2004 or later) or Windows 11."},
            {"step_number": 3, "heading": "Restart your computer",
             "instructions": "Restart when the installation finishes.",
             "warning": None},
            {"step_number": 4, "heading": "Create your Linux account",
             "instructions": "After the restart, Ubuntu opens and asks for a username and password. Choose them and press Enter.",
             "warning": "When you type the password, nothing appears on the screen. This is normal."},
            {"step_number": 5, "heading": "Check that it works",
             "instructions": "In Ubuntu, type pwd and press Enter. You should see a path like /home/yourname.",
             "warning": None},
        ],
    },
    {
        "id": "virtualbox",
        "title": "Install Ubuntu using VirtualBox",
        "difficulty": "Intermediate",
        "description": "Run Ubuntu in a virtual machine inside your current system.",
        "steps": [
            {"step_number": 1, "heading": "Download VirtualBox",
             "instructions": "Go to virtualbox.org, download VirtualBox for your system and install it with the default options.",
             "warning": None},
            {"step_number": 2, "heading": "Download Ubuntu",
             "instructions": "Go to ubuntu.com/download/desktop and download the Ubuntu Desktop ISO file.",
             "warning": "The file is large (about 5 GB), so use a good connection."},
            {"step_number": 3, "heading": "Create the virtual machine",
             "instructions": "Open VirtualBox, click New, give it a name, select the ISO file and choose Linux and Ubuntu as the type.",
             "warning": None},
            {"step_number": 4, "heading": "Give it resources",
             "instructions": "Set at least 4 GB of memory and 25 GB of disk space.",
             "warning": "Do not give more than half of your computer's memory to the virtual machine."},
            {"step_number": 5, "heading": "Install Ubuntu",
             "instructions": "Start the virtual machine and choose Install Ubuntu. Follow the screens and create your username and password.",
             "warning": None},
            {"step_number": 6, "heading": "Restart and log in",
             "instructions": "When asked, restart the virtual machine and log in. Open the terminal with Ctrl + Alt + T.",
             "warning": None},
        ],
    },
    {
        "id": "dual-boot",
        "title": "Install Linux using Dual Boot",
        "difficulty": "Advanced",
        "description": "Install Ubuntu next to Windows and choose which one to start.",
        "steps": [
            {"step_number": 1, "heading": "Back up your data",
             "instructions": "Copy your important files to an external drive or cloud storage.",
             "warning": "Dual booting can erase data if something goes wrong. Do not skip this step."},
            {"step_number": 2, "heading": "Make free space",
             "instructions": "Open Disk Management in Windows, right-click your main drive (C:), choose Shrink Volume and free at least 50 GB.",
             "warning": None},
            {"step_number": 3, "heading": "Create a bootable USB drive",
             "instructions": "Download the Ubuntu ISO and use a tool such as Rufus or balenaEtcher to write it to a USB drive of at least 8 GB.",
             "warning": "This erases everything on the USB drive."},
            {"step_number": 4, "heading": "Boot from the USB drive",
             "instructions": "Restart the computer, press the boot menu key (often F12, F10 or Esc) and choose the USB drive.",
             "warning": "The key depends on your computer brand. Search for your model's boot menu key if needed."},
            {"step_number": 5, "heading": "Install Ubuntu alongside Windows",
             "instructions": "Choose Install Ubuntu, then select the option to install alongside Windows, and follow the screens.",
             "warning": None},
            {"step_number": 6, "heading": "Choose your system at startup",
             "instructions": "After the restart a menu appears. Use the arrow keys to choose Ubuntu or Windows.",
             "warning": None},
        ],
    },
]

MODULES = [
    {
        "title": "Linux Fundamentals",
        "description": "Understand Linux and essential commands.",
        "lessons": [
            {
                "title": "Understanding the Linux Environment",
                "type": "reading",
                "content": [
                    {"heading": "The kernel", "text": "The kernel is the core of Linux. It talks to your hardware (processor, memory, disks) and manages every running program."},
                    {"heading": "The shell", "text": "The shell is a program that reads the commands you type and asks the kernel to run them. Bash is the most common shell."},
                    {"heading": "User space", "text": "Everything you run, such as your browser, editor and terminal, lives in user space on top of the kernel."},
                    {"heading": "Command-line interface", "text": "A command-line interface (CLI) lets you control the computer by typing text commands instead of clicking."},
                ],
            },
            {
                "title": "Understanding the Terminal",
                "type": "reading",
                "content": [
                    {"heading": "Terminal vs shell", "text": "The terminal is the window you type in. The shell is the program running inside it that understands your commands."},
                    {"heading": "Command syntax", "text": "Most commands look like this: command [options] [arguments]. Example: ls -l Documents."},
                    {"heading": "Options and arguments", "text": "Options change how a command behaves (like -l). Arguments tell it what to work on (like Documents)."},
                    {"heading": "Case sensitivity", "text": "Linux is case sensitive. Documents and documents are different names, and commands are written in lowercase."},
                ],
            },
            {
                "title": "Exploring the System",
                "type": "interactive",
                "content": [
                    {"heading": "Commands in this lesson", "text": "pwd, whoami, date, uname, history"},
                    {"heading": "How it works", "text": "Type each command in the practice terminal and press Enter. The terminal tells you if it is the right one."},
                ],
                "mission": "Find out who you are and where you are.",
                "steps": [
                    {"instruction": "Type the command that prints your current directory.",
                     "hint": "It stands for 'print working directory'.",
                     "command": "pwd", "output": "/home/student",
                     "feedback": "Correct! pwd shows the folder you are in."},
                    {"instruction": "Find out which user you are logged in as.",
                     "hint": "Think: who am I?",
                     "command": "whoami", "output": "student",
                     "feedback": "Correct! whoami prints your user name."},
                    {"instruction": "Show the current date and time.",
                     "hint": "The command is just the English word.",
                     "command": "date", "output": "Tue Nov 10 10:30:00 UTC 2026",
                     "feedback": "Correct! date shows the date and time."},
                    {"instruction": "Show the name of the operating system.",
                     "hint": "It starts with 'u' and is short for 'unix name'.",
                     "command": "uname", "output": "Linux",
                     "feedback": "Correct! uname tells you the system name."},
                    {"instruction": "Show the list of commands you typed earlier.",
                     "hint": "Think of your past, the commands' past.",
                     "command": "history", "output": "1  pwd\n2  whoami\n3  date\n4  uname",
                     "feedback": "Correct! history lists your earlier commands."},
                ],
            },
            {
                "title": "Navigation Basics",
                "type": "interactive",
                "content": [
                    {"heading": "Commands in this lesson", "text": "ls, cd, clear"},
                    {"heading": "How it works", "text": "ls lists what is in a folder, cd moves you into a folder, and clear cleans the screen."},
                ],
                "mission": "Look around and move between folders.",
                "steps": [
                    {"instruction": "List the files and folders in the current directory.",
                     "hint": "It is short for 'list'.",
                     "command": "ls", "output": "Desktop  Documents  Downloads  Music  Pictures",
                     "feedback": "Correct! ls lists the contents of a folder."},
                    {"instruction": "Move into the Documents folder.",
                     "hint": "Use cd followed by the folder name.",
                     "command": "cd Documents", "output": "",
                     "feedback": "Correct! You are now inside Documents."},
                    {"instruction": "Go back up one level to the parent folder.",
                     "hint": "Two dots mean the parent folder.",
                     "command": "cd ..", "output": "",
                     "feedback": "Correct! .. means the folder above."},
                    {"instruction": "Clean the terminal screen.",
                     "hint": "The command is the English word for making something clean and clear.",
                     "command": "clear", "output": "",
                     "feedback": "Correct! clear empties the screen."},
                ],
            },
        ],
        "questions": [
            {"q": "Which command shows your current directory?",
             "a": "ls", "b": "pwd", "c": "cd", "d": "date", "correct": "b",
             "explanation": "pwd means print working directory."},
            {"q": "What does the kernel do?",
             "a": "Draws windows on the screen", "b": "Controls hardware and manages programs",
             "c": "Stores your passwords", "d": "Connects only to the internet", "correct": "b",
             "explanation": "The kernel is the core of Linux. It manages hardware and programs."},
            {"q": "Which command shows the name of the current user?",
             "a": "whoami", "b": "uname", "c": "history", "d": "clear", "correct": "a",
             "explanation": "whoami prints the user name you are logged in with."},
            {"q": "Are the names File.txt and file.txt the same file in Linux?",
             "a": "Yes, always", "b": "No, Linux is case sensitive", "c": "Only on Ubuntu", "d": "Only for folders", "correct": "b",
             "explanation": "Linux treats uppercase and lowercase letters as different."},
            {"q": "Which command clears the terminal screen?",
             "a": "clean", "b": "cd", "c": "clear", "d": "ls", "correct": "c",
             "explanation": "clear removes the old text from the terminal."},
        ],
    },
    {
        "title": "Linux File System",
        "description": "Learn the directory structure and file commands.",
        "lessons": [
            {
                "title": "Linux Directory Structure",
                "type": "reading",
                "content": [
                    {"heading": "The root directory", "text": "Everything in Linux starts from one top folder called the root directory, written as /."},
                    {"heading": "The home directory", "text": "Your personal files live in /home/yourname. It can be written as ~ for short."},
                    {"heading": "Important directories", "text": "/etc holds settings, /bin holds basic programs, /var holds logs and changing data, /tmp holds temporary files."},
                    {"heading": "The hierarchy", "text": "All folders form a tree. Every folder sits inside another one, all the way up to /."},
                ],
            },
            {
                "title": "Paths and Navigation",
                "type": "reading",
                "content": [
                    {"heading": "Absolute paths", "text": "An absolute path starts at the root, for example /home/student/notes.txt. It works from anywhere."},
                    {"heading": "Relative paths", "text": "A relative path starts from where you are now, for example Documents/notes.txt."},
                    {"heading": "Parent and current directory", "text": "A single dot (.) means the current folder. Two dots (..) mean the parent folder."},
                    {"heading": "Hidden files", "text": "Files whose names start with a dot are hidden. Use ls -a to see them."},
                ],
            },
            {
                "title": "Creating and Managing Files",
                "type": "interactive",
                "content": [
                    {"heading": "Commands in this lesson", "text": "mkdir, touch, cp, mv, rm, rmdir"},
                    {"heading": "How it works", "text": "These commands create, copy, rename and delete files and folders. In Linux, a command that works usually prints nothing."},
                ],
                "mission": "Create, copy, rename and delete files and folders.",
                "steps": [
                    {"instruction": "Create a folder named projects.",
                     "hint": "mkdir means 'make directory'.",
                     "command": "mkdir projects", "output": "",
                     "feedback": "Correct! mkdir creates a folder."},
                    {"instruction": "Create an empty file named notes.txt.",
                     "hint": "This command is named after touching a file.",
                     "command": "touch notes.txt", "output": "",
                     "feedback": "Correct! touch creates an empty file."},
                    {"instruction": "Copy notes.txt to a new file named backup.txt.",
                     "hint": "cp takes the source first and the new name second.",
                     "command": "cp notes.txt backup.txt", "output": "",
                     "feedback": "Correct! cp makes a copy."},
                    {"instruction": "Rename backup.txt to old.txt.",
                     "hint": "mv means move, and moving to a new name renames it.",
                     "command": "mv backup.txt old.txt", "output": "",
                     "feedback": "Correct! mv moves or renames files."},
                    {"instruction": "Delete the file old.txt.",
                     "hint": "rm means remove.",
                     "command": "rm old.txt", "output": "",
                     "feedback": "Correct! rm deletes a file. There is no recycle bin, so be careful."},
                    {"instruction": "Remove the empty folder projects.",
                     "hint": "rmdir means 'remove directory'.",
                     "command": "rmdir projects", "output": "",
                     "feedback": "Correct! rmdir removes an empty folder."},
                ],
            },
            {
                "title": "Reading and Searching Files",
                "type": "interactive",
                "content": [
                    {"heading": "Commands in this lesson", "text": "cat, head, tail, find, echo"},
                    {"heading": "How it works", "text": "cat shows a whole file, head shows the first lines, tail shows the last lines, find searches for files and echo prints text."},
                ],
                "mission": "Read files and search for them.",
                "steps": [
                    {"instruction": "Print the text Hello Linux on the screen.",
                     "hint": "echo repeats what you give it.",
                     "command": "echo Hello Linux|echo \"Hello Linux\"", "output": "Hello Linux",
                     "feedback": "Correct! echo prints text."},
                    {"instruction": "Show everything inside notes.txt.",
                     "hint": "cat shows the whole file.",
                     "command": "cat notes.txt",
                     "output": "Line 1: Learn Linux\nLine 2: Practice daily\nLine 3: Build projects",
                     "feedback": "Correct! cat prints the whole file."},
                    {"instruction": "Show only the first 2 lines of notes.txt.",
                     "hint": "Use head with the -n option.",
                     "command": "head -n 2 notes.txt|head -2 notes.txt",
                     "output": "Line 1: Learn Linux\nLine 2: Practice daily",
                     "feedback": "Correct! head shows the beginning of a file."},
                    {"instruction": "Show only the last 2 lines of notes.txt.",
                     "hint": "tail is the opposite of head.",
                     "command": "tail -n 2 notes.txt|tail -2 notes.txt",
                     "output": "Line 2: Practice daily\nLine 3: Build projects",
                     "feedback": "Correct! tail shows the end of a file."},
                    {"instruction": "Find the file named notes.txt starting from the current folder.",
                     "hint": "Use find . -name followed by the file name.",
                     "command": "find . -name notes.txt|find . -name \"notes.txt\"",
                     "output": "./notes.txt",
                     "feedback": "Correct! find searches for files by name."},
                ],
            },
        ],
        "questions": [
            {"q": "Which directory is the root of the Linux file system?",
             "a": "/home", "b": "/", "c": "/root", "d": "/etc", "correct": "b",
             "explanation": "The single slash is the top of the whole tree."},
            {"q": "Which of these is an absolute path?",
             "a": "Documents/notes.txt", "b": "../notes.txt", "c": "/home/student/notes.txt", "d": "./notes.txt", "correct": "c",
             "explanation": "An absolute path starts with / and works from anywhere."},
            {"q": "Which command creates an empty file?",
             "a": "mkdir", "b": "touch", "c": "cp", "d": "cat", "correct": "b",
             "explanation": "touch creates an empty file if it does not exist."},
            {"q": "Which command shows the last lines of a file?",
             "a": "head", "b": "cat", "c": "tail", "d": "find", "correct": "c",
             "explanation": "tail shows the end of a file."},
            {"q": "What does .. mean in a path?",
             "a": "The current folder", "b": "The parent folder", "c": "The home folder", "d": "The root folder", "correct": "b",
             "explanation": "Two dots point to the folder above the current one."},
        ],
    },
    {
        "title": "Users and Permissions",
        "description": "Learn about users, groups and file permissions.",
        "lessons": [],
        "questions": [],
    },
]


def seed_database():
    conn = get_db_connection()

    # Only fill the database once
    count = conn.execute("SELECT COUNT(*) FROM modules").fetchone()[0]
    if count > 0:
        conn.close()
        return

    for guide in SETUP_GUIDES:
        conn.execute(
            "INSERT INTO setup_guides (id, title, difficulty, description, steps_json) VALUES (?, ?, ?, ?, ?)",
            (guide["id"], guide["title"], guide["difficulty"], guide["description"], json.dumps(guide["steps"])),
        )

    for module_position, module in enumerate(MODULES, start=1):
        cursor = conn.execute(
            "INSERT INTO modules (title, description, position) VALUES (?, ?, ?)",
            (module["title"], module["description"], module_position),
        )
        module_id = cursor.lastrowid

        for lesson_position, lesson in enumerate(module["lessons"], start=1):
            cursor = conn.execute(
                "INSERT INTO lessons (module_id, title, type, content_json, mission, position) VALUES (?, ?, ?, ?, ?, ?)",
                (module_id, lesson["title"], lesson["type"], json.dumps(lesson["content"]),
                 lesson.get("mission"), lesson_position),
            )
            lesson_id = cursor.lastrowid

            for step_number, step in enumerate(lesson.get("steps", []), start=1):
                conn.execute(
                    "INSERT INTO steps (lesson_id, step_number, instruction, hint, expected_command, output, feedback) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (lesson_id, step_number, step["instruction"], step["hint"],
                     step["command"], step["output"], step["feedback"]),
                )

        for q in module.get("questions", []):
            conn.execute(
                "INSERT INTO questions (module_id, question, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (module_id, q["q"], q["a"], q["b"], q["c"], q["d"], q["correct"], q["explanation"]),
            )

    conn.commit()
    conn.close()