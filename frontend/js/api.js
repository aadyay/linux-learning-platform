/* =========================================================
   LINUXLEARN — MOCK API (VERSION 2)
   Multi-lesson curriculum + setup guides + lesson progress.
   This is a frontend prototype. It does NOT run real Linux commands.
   ========================================================= */

const USE_MOCK = false;
const API_URL = "http://localhost:8000";

async function request(endpoint, options = {}) {
    if (USE_MOCK) return mockRequest(endpoint, options);

    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(API_URL + endpoint, {
        ...options,
        headers
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Something went wrong");
    return data;
}

/* =========================================================
   1. MOCK USERS — keep the existing user accounts
   ========================================================= */

let mockUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");

function saveMockUsers() {
    localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
}

/* =========================================================
   2. VERSION 2 PROGRESS
   A separate key prevents old module-based progress from
   conflicting with the new lesson-based progress.
   ========================================================= */

const DEFAULT_PROGRESS = {
    completed_lessons: [],
    best_scores: {},
    challenge_completed: [],
    completed_module_assessments: [],
    final_assessment_completed: false
};

let mockProgress = JSON.parse(
    localStorage.getItem("mockProgressV2") || "null"
) || structuredClone(DEFAULT_PROGRESS);

function saveMockProgress() {
    localStorage.setItem("mockProgressV2", JSON.stringify(mockProgress));
}

function resetMockProgress() {
    mockProgress = structuredClone(DEFAULT_PROGRESS);
    saveMockProgress();
}

/* =========================================================
   3. SETUP GUIDES
   ========================================================= */

const mockSetupGuides = [
    {
        id: "wsl",
        title: "Install Ubuntu using WSL",
        difficulty: "Beginner",
        description: "Run a Linux environment inside Windows without replacing Windows.",
        steps: [
            {
                step_number: 1,
                heading: "Check your Windows version",
                instructions: "Use a supported, updated Windows 10 or Windows 11 installation. Save your work before changing system settings.",
                warning: null
            },
            {
                step_number: 2,
                heading: "Open PowerShell as Administrator",
                instructions: "Open the Start menu, search for PowerShell or Windows Terminal, right-click it and choose Run as administrator.",
                warning: "Only run installation commands from a trusted source."
            },
            {
                step_number: 3,
                heading: "Install WSL",
                instructions: "Run: wsl --install. Follow any prompts and restart Windows if asked.",
                warning: "The exact prompts can vary by Windows version and system configuration."
            },
            {
                step_number: 4,
                heading: "Open Ubuntu",
                instructions: "After installation, open Ubuntu from the Start menu. Allow the first-time setup to finish."
            },
            {
                step_number: 5,
                heading: "Create your Linux account",
                instructions: "Choose a Linux username and password. When typing the password, the terminal may not show characters; this is normal."
            },
            {
                step_number: 6,
                heading: "Update package information",
                instructions: "In Ubuntu, run: sudo apt update. Enter your Linux password if requested."
            },
            {
                step_number: 7,
                heading: "Verify your installation",
                instructions: "Try: whoami, pwd, uname -a and ls. If these commands return information, your Ubuntu terminal is ready."
            }
        ]
    },
    {
        id: "virtualbox",
        title: "Install Ubuntu using VirtualBox",
        difficulty: "Intermediate",
        description: "Run Ubuntu in a virtual machine while keeping your existing operating system.",
        steps: [
            {
                step_number: 1,
                heading: "Prepare your computer",
                instructions: "Check available storage and memory. Back up important files before making system-level changes."
            },
            {
                step_number: 2,
                heading: "Get trusted installers",
                instructions: "Download VirtualBox from its official website and the Ubuntu Desktop ISO from Ubuntu's official website."
            },
            {
                step_number: 3,
                heading: "Create a virtual machine",
                instructions: "In VirtualBox, create a new Linux virtual machine and select the Ubuntu ISO as its installation image."
            },
            {
                step_number: 4,
                heading: "Allocate resources",
                instructions: "Choose memory, CPU and virtual disk settings that fit your computer. Avoid allocating all available resources."
            },
            {
                step_number: 5,
                heading: "Install Ubuntu",
                instructions: "Start the virtual machine and follow the Ubuntu installer. Review disk choices carefully; install inside the virtual disk, not your physical Windows drive."
            },
            {
                step_number: 6,
                heading: "Verify Ubuntu",
                instructions: "Open Terminal and run whoami, pwd and uname -a."
            }
        ]
    },
    {
        id: "dual-boot",
        title: "Install Linux using Dual Boot",
        difficulty: "Advanced",
        description: "Install Linux alongside an existing operating system and choose one when the computer starts.",
        steps: [
            {
                step_number: 1,
                heading: "Understand the risks",
                instructions: "Dual boot changes disk partitions and boot configuration. A mistake can cause data loss or make an operating system unbootable.",
                warning: "Back up important data first. This guide is educational, not a substitute for device-specific instructions."
            },
            {
                step_number: 2,
                heading: "Check compatibility",
                instructions: "Check your computer manufacturer's documentation, firmware mode, storage layout and Ubuntu's current installation guidance."
            },
            {
                step_number: 3,
                heading: "Prepare installation media",
                instructions: "Use the official Ubuntu ISO and a trusted tool to create a bootable USB drive."
            },
            {
                step_number: 4,
                heading: "Review disk layout",
                instructions: "Understand partitions and available unallocated space before proceeding. Do not delete or format a partition unless you know exactly what it contains.",
                warning: "Stop and seek expert help if you are unsure which partition is which."
            },
            {
                step_number: 5,
                heading: "Follow the official installer",
                instructions: "Use the current Ubuntu installation guide for your firmware and disk configuration. Review every disk and bootloader choice before confirming."
            },
            {
                step_number: 6,
                heading: "Test both operating systems",
                instructions: "Restart and verify that you can boot into both operating systems. Keep your recovery and backup options available."
            }
        ]
    }
];

/* =========================================================
   4. LESSON FACTORY
   Each lesson has theory, guided steps, a challenge and quiz.
   ========================================================= */

function makeQuestion(id, question, options, correct_option, explanation) {
    return { id, question, options, correct_option, explanation };
}

function makeLesson(data) {
    return {
        id: data.id,
        module_id: data.module_id,
        title: data.title,
        objective: data.objective,
        estimated_minutes: data.estimated_minutes || 15,
        mission: data.objective,
        theory: data.theory,
        steps: data.steps,
        challenge: data.challenge
    };
}

const lessonList = [
    makeLesson({
        id: 101, module_id: 1, title: "What is Linux?",
        objective: "Understand Linux, operating systems and Linux distributions.",
        theory: [
            {
                heading: "What is an operating system?",
                content: "An operating system (OS) is system software that manages computer hardware and provides services for applications. It helps programs use the CPU, memory, storage and input/output devices.",
                key_points: ["The OS manages hardware resources.", "Applications run with the help of the OS.", "Windows, macOS and Linux-based systems are examples."]
            },
            {
                heading: "What is Linux?",
                content: "Linux is technically an open-source operating system kernel. A complete Linux-based operating system combines the kernel with system tools, libraries and applications. These complete systems are commonly called Linux distributions.",
                key_points: ["Linux is open source.", "The kernel manages communication between software and hardware.", "Linux is used on desktops, servers, embedded devices and more."]
            },
            {
                heading: "What is a distribution?",
                content: "A Linux distribution packages the Linux kernel with software, tools and a package manager. Ubuntu, Fedora and Debian are examples. They share the Linux kernel but differ in defaults, release policies and tools.",
                key_points: ["Ubuntu is a distribution, not a separate kernel.", "Different distributions suit different needs.", "This course uses Ubuntu examples."]
            }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Understand the environment", text: "A Linux system includes the kernel, system utilities, applications and a way for users to interact with it.", example_command: "uname -s", example_output: "Linux", hint: "uname -s displays the operating-system kernel name." },
            { step_number: 2, kind: "try", title: "Identify the system", text: "Run uname -s in the practice terminal.", example_command: "uname -s", example_output: "Linux", command_to_try: "uname -s", check: { type: "ran_command", value: "uname" }, hint: "Use uname to display system information." },
            { step_number: 3, kind: "challenge", title: "Identify your user", text: "Find out which user is currently using the terminal.", example_command: "whoami", example_output: "user", command_to_try: "whoami", check: { type: "ran_command", value: "whoami" }, hint: "The command name is a question: who am I?" }
        ],
        challenge: { title: "Identify your Linux environment", instructions: "Run whoami in the practice terminal.", check: { type: "ran_command", value: "whoami" } }
    }),
    makeLesson({
        id: 102, module_id: 1, title: "Linux Distributions",
        objective: "Compare distributions and understand why Ubuntu is used in this course.",
        theory: [
            { heading: "Why are there different distributions?", content: "Different distributions select different software, desktop environments, package managers and update policies. This lets users choose a system that fits their needs.", key_points: ["Distributions share the Linux kernel family.", "They may use different package managers.", "Some prioritize stability while others prioritize newer software."] },
            { heading: "Ubuntu, Debian and Fedora", content: "Ubuntu is based on Debian and commonly uses APT for packages. Debian is known for its focus on stability. Fedora is associated with newer technologies and uses DNF.", key_points: ["Ubuntu and Debian use APT tools.", "Fedora uses DNF.", "Commands can differ between distributions."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Choose a distribution", text: "Ubuntu is a common beginner choice and has extensive documentation. The examples in this platform are Ubuntu-oriented.", example_command: "cat /etc/os-release", example_output: "NAME=\"Ubuntu\"", hint: "This file contains operating-system identification information." },
            { step_number: 2, kind: "try", title: "Inspect system information", text: "Try the system identification command.", example_command: "uname -a", example_output: "Linux user ...", command_to_try: "uname -a", check: { type: "ran_command", value: "uname" }, hint: "The -a option asks uname to show available system information." },
            { step_number: 3, kind: "challenge", title: "Check your current user", text: "Run whoami to identify the active account.", example_command: "whoami", example_output: "user", command_to_try: "whoami", check: { type: "ran_command", value: "whoami" }, hint: "Use whoami." }
        ],
        challenge: { title: "Check the active account", instructions: "Run whoami.", check: { type: "ran_command", value: "whoami" } }
    }),
    makeLesson({
        id: 103, module_id: 1, title: "Terminal and Shell",
        objective: "Understand the terminal, shell, command syntax and command options.",
        theory: [
            { heading: "Terminal vs shell", content: "A terminal is the interface where you type and view text. A shell is the program that reads commands and asks the operating system to carry them out. Bash is a commonly used shell on Ubuntu.", key_points: ["Terminal = interface.", "Shell = command interpreter.", "Bash is one example of a shell."] },
            { heading: "Command structure", content: "A command commonly has a command name followed by options and arguments. For example, ls -l /home asks ls to show a detailed listing of /home. Linux paths and command names are generally case-sensitive.", key_points: ["Command: what to run.", "Option: changes how it behaves.", "Argument: the item it acts on.", "Uppercase and lowercase can mean different things."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Read a command", text: "In ls -l /home, ls is the command, -l is an option and /home is an argument.", example_command: "ls -l", example_output: "drwxr-xr-x ... docs", hint: "Options often begin with a hyphen." },
            { step_number: 2, kind: "try", title: "Run a command", text: "Use ls to list the current directory.", example_command: "ls", example_output: "docs notes.txt", command_to_try: "ls", check: { type: "ran_command", value: "ls" }, hint: "Type ls." },
            { step_number: 3, kind: "challenge", title: "Use a command option", text: "Display a detailed listing.", example_command: "ls -l", example_output: "drwxr-xr-x ... docs", command_to_try: "ls -l", check: { type: "ran_command", value: "ls -l" }, hint: "Add the -l option to ls." }
        ],
        challenge: { title: "Display a detailed listing", instructions: "Run ls -l.", check: { type: "ran_command", value: "ls -l" } }
    }),
    makeLesson({
        id: 104, module_id: 1, title: "Essential Navigation Commands",
        objective: "Identify the current location and move around the directory structure.",
        theory: [
            { heading: "Know where you are", content: "The shell keeps a current working directory. pwd prints its full path. This helps you understand where relative paths will be interpreted.", key_points: ["pwd means print working directory.", "A path describes a location.", "The home directory is commonly represented by ~."] },
            { heading: "List and move", content: "ls lists directory contents. cd changes the current directory. Use cd .. to move to the parent directory and cd ~ to return to your home directory.", key_points: ["ls lists files and directories.", "cd changes directory.", "clear clears the visible terminal screen.", "history shows previously entered commands in many shells."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Check your location", text: "Use pwd to display the current working directory.", example_command: "pwd", example_output: "/home/user", hint: "pwd prints the working directory." },
            { step_number: 2, kind: "try", title: "List the contents", text: "Use ls to see files and directories.", example_command: "ls", example_output: "docs notes.txt", command_to_try: "ls", check: { type: "ran_command", value: "ls" }, hint: "Use ls." },
            { step_number: 3, kind: "challenge", title: "Enter the docs folder", text: "Move into the docs directory.", example_command: "cd docs", example_output: "", command_to_try: "cd docs", check: { type: "cwd_is", value: "/home/user/docs" }, hint: "Use cd docs." }
        ],
        challenge: { title: "Navigate into docs", instructions: "Move into /home/user/docs.", check: { type: "cwd_is", value: "/home/user/docs" } }
    }),
    makeLesson({
        id: 201, module_id: 2, title: "Linux Directory Hierarchy",
        objective: "Understand the root directory and common system directories.",
        theory: [
            { heading: "The root directory", content: "Linux organizes files in one tree that begins at /. This is the root directory. It is different from the root user's home directory, which is commonly /root.", key_points: ["/ is the top of the filesystem tree.", "/home contains users' home directories.", "/root is the root user's home directory."] },
            { heading: "Important directories", content: "/etc commonly stores system configuration, /var stores variable data such as logs, /tmp stores temporary files, and /bin contains essential command binaries on systems that use this layout.", key_points: ["/etc — configuration.", "/var — variable data and logs.", "/tmp — temporary files.", "/usr — many user-space programs and shared resources."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Understand the tree", text: "Every absolute Linux path begins at /.", example_command: "pwd", example_output: "/home/user", hint: "An absolute path begins with /." },
            { step_number: 2, kind: "try", title: "Inspect your location", text: "Run pwd to see your current path.", example_command: "pwd", example_output: "/home/user", command_to_try: "pwd", check: { type: "ran_command", value: "pwd" }, hint: "Use pwd." },
            { step_number: 3, kind: "challenge", title: "List your home directory", text: "Display the files and folders in your current home directory.", example_command: "ls", example_output: "docs notes.txt", command_to_try: "ls", check: { type: "ran_command", value: "ls" }, hint: "Use ls." }
        ],
        challenge: { title: "Explore the home directory", instructions: "Run ls to inspect the current directory.", check: { type: "ran_command", value: "ls" } }
    }),
    makeLesson({
        id: 202, module_id: 2, title: "Paths and Hidden Files",
        objective: "Distinguish absolute and relative paths and recognize hidden files.",
        theory: [
            { heading: "Absolute and relative paths", content: "An absolute path starts from /. A relative path is interpreted from the current working directory. The special name . means the current directory and .. means its parent.", key_points: ["Absolute: /home/user/docs.", "Relative: docs/notes.txt.", ". means current directory.", ".. means parent directory."] },
            { heading: "Hidden files", content: "On Linux, a filename beginning with a dot is treated as hidden by many directory-listing tools. Use ls -a to include hidden entries.", key_points: ["Hidden names begin with a dot.", "ls -a shows hidden entries.", "A hidden file is not automatically secure."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Compare paths", text: "If you are in /home/user, docs is a relative path and /home/user/docs is an absolute path.", example_command: "pwd", example_output: "/home/user", hint: "Absolute paths start at /." },
            { step_number: 2, kind: "try", title: "List hidden entries", text: "Use ls -a to include hidden entries.", example_command: "ls -a", example_output: ". .. .profile docs notes.txt", command_to_try: "ls -a", check: { type: "ran_command", value: "ls -a" }, hint: "Add -a to ls." },
            { step_number: 3, kind: "challenge", title: "Move to the parent", text: "Move one directory up using ..", example_command: "cd ..", example_output: "", command_to_try: "cd ..", check: { type: "cwd_is", value: "/home" }, hint: "Use cd .." }
        ],
        challenge: { title: "Move to the parent directory", instructions: "Run cd .. from /home/user.", check: { type: "cwd_is", value: "/home" } }
    }),
    makeLesson({
        id: 203, module_id: 2, title: "Creating and Managing Files",
        objective: "Create directories and files, and understand copy, move and remove operations.",
        theory: [
            { heading: "Directories and files", content: "mkdir creates directories and touch can create an empty file. cp copies files or directories, while mv moves or renames them. rm removes files; rmdir removes empty directories.", key_points: ["mkdir — create a directory.", "touch — create an empty file or update timestamps.", "cp — copy.", "mv — move or rename.", "rm — remove files.", "rmdir — remove an empty directory."] },
            { heading: "Be careful when deleting", content: "Removal commands can permanently delete data. In this learning platform, commands operate only on a simulated filesystem. On a real computer, check the path carefully before removing anything.", key_points: ["Check the target before deleting.", "rm does not normally move files to a recycle bin.", "rmdir only removes empty directories."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Create a directory", text: "mkdir creates a new directory in the current location.", example_command: "mkdir practice", example_output: "", hint: "mkdir is short for make directory." },
            { step_number: 2, kind: "try", title: "Create a directory", text: "Create a folder named practice.", example_command: "mkdir practice", example_output: "", command_to_try: "mkdir practice", check: { type: "path_exists", value: "/home/user/practice" }, hint: "Type mkdir practice." },
            { step_number: 3, kind: "challenge", title: "Create a file", text: "Create an empty file named hello.txt in your home directory.", example_command: "touch hello.txt", example_output: "", command_to_try: "touch hello.txt", check: { type: "path_exists", value: "/home/user/hello.txt" }, hint: "Use touch followed by the filename." }
        ],
        challenge: { title: "Create hello.txt", instructions: "Create /home/user/hello.txt.", check: { type: "path_exists", value: "/home/user/hello.txt" } }
    }),
    makeLesson({
        id: 204, module_id: 2, title: "Reading and Searching Files",
        objective: "Read file contents, write simple text and search for files.",
        theory: [
            { heading: "Read file contents", content: "cat prints file contents. head displays the beginning of a file and tail displays the end. These are useful when a file is too long to inspect all at once.", key_points: ["cat — display file contents.", "head — beginning of a file.", "tail — end of a file."] },
            { heading: "Write and search", content: "echo prints text and can be combined with redirection to write output to a file. find searches for files and directories under a specified starting location.", key_points: ["echo displays text.", "> redirects output and overwrites a file.", ">> appends output when supported.", "find searches directory trees."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Read a file", text: "cat notes.txt displays the contents of notes.txt.", example_command: "cat notes.txt", example_output: "Welcome to Linux!", hint: "Put the filename after cat." },
            { step_number: 2, kind: "try", title: "Display file contents", text: "Read notes.txt.", example_command: "cat notes.txt", example_output: "Welcome to Linux!", command_to_try: "cat notes.txt", check: { type: "ran_command", value: "cat" }, hint: "Use cat notes.txt." },
            { step_number: 3, kind: "challenge", title: "Write a message", text: "Write a short message into a file using echo and redirection.", example_command: "echo Hello > message.txt", example_output: "", command_to_try: "echo Hello > message.txt", check: { type: "path_exists", value: "/home/user/message.txt" }, hint: "Use echo text > filename." }
        ],
        challenge: { title: "Create a message file", instructions: "Create message.txt using echo and >.", check: { type: "path_exists", value: "/home/user/message.txt" } }
    }),
    makeLesson({
        id: 301, module_id: 3, title: "Users and Groups",
        objective: "Understand Linux accounts, groups and user identity.",
        theory: [
            { heading: "Users", content: "Linux is a multi-user operating system. Each user account has an identity and permissions. Processes generally run with the privileges of the user who started them.", key_points: ["A user account identifies a person or service.", "whoami prints the effective username.", "id displays user and group identity information."] },
            { heading: "Groups", content: "Groups let administrators assign permissions to collections of users. A user can belong to one or more groups. The groups command displays the groups associated with the current user.", key_points: ["Groups simplify shared access.", "id shows user and group IDs.", "groups lists group memberships."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Identify the current user", text: "whoami displays the current effective username.", example_command: "whoami", example_output: "user", hint: "Use whoami." },
            { step_number: 2, kind: "try", title: "Check your identity", text: "Run id to see user and group IDs.", example_command: "id", example_output: "uid=1000(user) gid=1000(user)", command_to_try: "id", check: { type: "ran_command", value: "id" }, hint: "Use id." },
            { step_number: 3, kind: "challenge", title: "List your groups", text: "Display the groups associated with the current user.", example_command: "groups", example_output: "user", command_to_try: "groups", check: { type: "ran_command", value: "groups" }, hint: "Use groups." }
        ],
        challenge: { title: "List current groups", instructions: "Run groups.", check: { type: "ran_command", value: "groups" } }
    }),
    makeLesson({
        id: 302, module_id: 3, title: "Understanding File Permissions",
        objective: "Read permission strings and understand owner, group and others.",
        theory: [
            { heading: "Three permission categories", content: "Linux file permissions are commonly shown for three categories: owner, group and others. These categories determine which users can access a file or directory.", key_points: ["Owner — the file's owning user.", "Group — users in the file's group.", "Others — everyone else."] },
            { heading: "Read, write and execute", content: "The letters r, w and x represent read, write and execute permissions. For a directory, execute permission is needed to access entries inside it. ls -l displays a long listing including permissions.", key_points: ["r = read.", "w = write.", "x = execute.", "- = permission not granted."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Read a permission string", text: "In -rw-r--r--, the first character indicates file type, followed by permissions for owner, group and others.", example_command: "ls -l", example_output: "-rw-r--r-- notes.txt", hint: "Read the permission groups from left to right." },
            { step_number: 2, kind: "try", title: "Inspect permissions", text: "Run ls -l to view the simulated file permissions.", example_command: "ls -l", example_output: "-rw-r--r-- notes.txt", command_to_try: "ls -l", check: { type: "ran_command", value: "ls -l" }, hint: "Use ls with the -l option." },
            { step_number: 3, kind: "challenge", title: "Inspect the file", text: "Use ls -l to inspect the current directory in detail.", example_command: "ls -l", example_output: "-rw-r--r-- notes.txt", command_to_try: "ls -l", check: { type: "ran_command", value: "ls -l" }, hint: "Use ls -l." }
        ],
        challenge: { title: "Inspect file permissions", instructions: "Run ls -l.", check: { type: "ran_command", value: "ls -l" } }
    }),
    makeLesson({
        id: 303, module_id: 3, title: "Changing Permissions with chmod",
        objective: "Change permissions symbolically and understand numeric permission notation.",
        theory: [
            { heading: "The chmod command", content: "chmod changes file or directory permissions. Symbolic notation uses categories such as u (owner), g (group), o (others) and operations such as + (add), - (remove) and = (set).", key_points: ["chmod changes permissions.", "u = owner, g = group, o = others.", "+ adds and - removes permissions.", "Example: chmod +x script.sh adds execute permission."] },
            { heading: "Numeric permissions", content: "Numeric permissions use 4 for read, 2 for write and 1 for execute. Add the values for each category. For example, 755 means owner has 7 (4+2+1), group has 5 (4+1), and others have 5 (4+1).", key_points: ["4 = read.", "2 = write.", "1 = execute.", "755 = rwx for owner, r-x for group and others.", "644 = rw- for owner, r-- for group and others."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Add execute permission", text: "chmod +x notes.txt adds execute permission in the simulator.", example_command: "chmod +x notes.txt", example_output: "", hint: "+x adds execute permission." },
            { step_number: 2, kind: "try", title: "Change permissions", text: "Make notes.txt executable.", example_command: "chmod +x notes.txt", example_output: "", command_to_try: "chmod +x notes.txt", check: { type: "file_executable", value: "/home/user/notes.txt" }, hint: "Use chmod +x notes.txt." },
            { step_number: 3, kind: "challenge", title: "Verify the permission", text: "Run ls -l after changing the permission.", example_command: "ls -l", example_output: "-rwxr-xr-x notes.txt", command_to_try: "ls -l", check: { type: "ran_command", value: "ls -l" }, hint: "Use ls -l to inspect the result." }
        ],
        challenge: { title: "Make notes.txt executable", instructions: "Run chmod +x notes.txt.", check: { type: "file_executable", value: "/home/user/notes.txt" } }
    }),
    makeLesson({
        id: 304, module_id: 3, title: "Ownership, Root and sudo",
        objective: "Understand file ownership and why administrative commands require care.",
        theory: [
            { heading: "Ownership", content: "Files and directories have an owning user and group. Ownership helps determine which permission set applies. chown is used to change ownership and normally requires administrative privileges.", key_points: ["Every file has an owner and group.", "chown changes ownership.", "Ownership is different from permissions."] },
            { heading: "Root and sudo", content: "The root account has extensive administrative privileges. sudo allows an authorized user to run a command with elevated privileges. Use it carefully because administrative commands can change important system files.", key_points: ["Root is the administrative user.", "sudo runs an authorized command with elevated privileges.", "Do not copy privileged commands without understanding them."] }
        ],
        steps: [
            { step_number: 1, kind: "learn", title: "Understand administrative access", text: "sudo is used before a command when elevated privileges are required. The simulator explains this concept but does not grant real system access.", example_command: "sudo apt update", example_output: "Package information updated (illustrative)", hint: "sudo requests elevated privileges." },
            { step_number: 2, kind: "try", title: "Identify your user", text: "Run whoami to identify the active user.", example_command: "whoami", example_output: "user", command_to_try: "whoami", check: { type: "ran_command", value: "whoami" }, hint: "Use whoami." },
            { step_number: 3, kind: "challenge", title: "Inspect identity information", text: "Run id to inspect your user and group identity.", example_command: "id", example_output: "uid=1000(user) gid=1000(user)", command_to_try: "id", check: { type: "ran_command", value: "id" }, hint: "Use id." }
        ],
        challenge: { title: "Inspect your account", instructions: "Run id.", check: { type: "ran_command", value: "id" } }
    })
];

const mockLessons = Object.fromEntries(lessonList.map(lesson => [lesson.id, lesson]));

/* =========================================================
   5. QUIZZES
   Five questions per lesson. Correct answers stay in mock data.
   ========================================================= */

const mockQuestions = {
    101: [
        makeQuestion(1, "What is the main role of an operating system?", ["Manage hardware and provide services to applications", "Only browse the internet", "Only create documents", "Replace the CPU"], 0, "An operating system manages hardware resources and provides services to applications."),
        makeQuestion(2, "What is Linux technically?", ["A web browser", "An open-source kernel", "A database", "A programming language"], 1, "Linux is technically an open-source operating system kernel."),
        makeQuestion(3, "What is Ubuntu?", ["A Linux distribution", "A shell command", "A hardware component", "A text editor"], 0, "Ubuntu is a Linux distribution."),
        makeQuestion(4, "Which component manages communication between software and hardware?", ["Wallpaper", "Kernel", "Web page", "Text file"], 1, "The kernel manages system resources and hardware interactions."),
        makeQuestion(5, "Which statement about Linux is correct?", ["It is only used on laptops", "It is closed source", "It is used in many kinds of devices and systems", "It is a spreadsheet program"], 2, "Linux-based systems are used on servers, desktops, embedded devices and more.")
    ],
    102: [
        makeQuestion(1, "What is a Linux distribution?", ["A packaged Linux-based operating system", "A computer brand", "A file extension", "A terminal prompt"], 0, "A distribution combines the Linux kernel with tools, software and defaults."),
        makeQuestion(2, "Which distribution is used for examples in this course?", ["Fedora", "Ubuntu", "Arch only", "Windows"], 1, "This course uses Ubuntu-oriented examples."),
        makeQuestion(3, "Which package tool is commonly used by Ubuntu?", ["DNF", "APT", "Photoshop", "GitHub"], 1, "Ubuntu commonly uses APT for package management."),
        makeQuestion(4, "Which distribution commonly uses DNF?", ["Fedora", "Ubuntu", "Debian", "Linux Mint Debian Edition"], 0, "Fedora uses DNF as its package manager."),
        makeQuestion(5, "Why do different distributions exist?", ["They have different software choices and goals", "Linux requires a different CPU for each", "They are all web browsers", "They cannot run applications"], 0, "Distributions make different choices about software, updates and defaults.")
    ],
    103: [
        makeQuestion(1, "What is a terminal?", ["A text-based interface", "The Linux kernel", "A file permission", "A user group"], 0, "A terminal provides an interface for entering and viewing text commands."),
        makeQuestion(2, "What is a shell?", ["A command interpreter", "A monitor", "A directory", "A hardware cable"], 0, "A shell reads commands and requests that the operating system carry them out."),
        makeQuestion(3, "Which is a commonly used shell?", ["Bash", "HTML", "CSS", "JPEG"], 0, "Bash is a commonly used shell on Ubuntu."),
        makeQuestion(4, "In ls -l /home, what is -l?", ["An option", "A username", "A directory", "A second command"], 0, "-l is an option that changes the listing format."),
        makeQuestion(5, "Are Linux command names generally case-sensitive?", ["Yes", "No", "Only on Fridays", "Only in folders"], 0, "Linux command names and paths are generally case-sensitive.")
    ],
    104: [
        makeQuestion(1, "Which command prints the current working directory?", ["ls", "pwd", "cd", "clear"], 1, "pwd prints the current working directory."),
        makeQuestion(2, "Which command lists directory contents?", ["ls", "whoami", "date", "touch"], 0, "ls lists files and directories."),
        makeQuestion(3, "Which command changes the current directory?", ["pwd", "cd", "cat", "echo"], 1, "cd changes the current directory."),
        makeQuestion(4, "What does cd .. usually do?", ["Moves to the parent directory", "Deletes a directory", "Creates a file", "Prints the date"], 0, "The .. path component refers to the parent directory."),
        makeQuestion(5, "Which command clears the visible terminal screen?", ["clear", "mkdir", "id", "find"], 0, "clear clears the visible terminal screen.")
    ],
    201: [
        makeQuestion(1, "Which symbol represents the root directory?", ["~", ".", "/", "#"], 2, "The root directory is represented by /."),
        makeQuestion(2, "Which directory commonly contains users' home directories?", ["/etc", "/home", "/tmp", "/var"], 1, "/home commonly contains users' home directories."),
        makeQuestion(3, "Where are many system configuration files commonly stored?", ["/etc", "/home", "/media", "/proc"], 0, "/etc commonly stores system configuration."),
        makeQuestion(4, "Which directory commonly stores variable data and logs?", ["/var", "/bin", "/boot", "/home"], 0, "/var stores variable data, including many logs."),
        makeQuestion(5, "Is /root the same as /?", ["Yes", "No", "Only on Windows", "Only for guests"], 1, "/ is the filesystem root; /root is commonly the root user's home directory.")
    ],
    202: [
        makeQuestion(1, "What does an absolute path begin with?", [".", "/", "~", "-"], 1, "An absolute path starts from the root directory /."),
        makeQuestion(2, "A relative path is interpreted from where?", ["The current working directory", "The BIOS", "The internet", "The root user's password"], 0, "A relative path is interpreted from the current working directory."),
        makeQuestion(3, "What does .. represent in a path?", ["Current directory", "Parent directory", "Root user", "Hidden file"], 1, ".. refers to the parent directory."),
        makeQuestion(4, "Which command includes hidden entries in a listing?", ["ls -a", "pwd -p", "cd -a", "rm -a"], 0, "ls -a includes hidden entries."),
        makeQuestion(5, "How do many Linux tools identify hidden filenames?", ["They begin with a dot", "They end with .hidden", "They contain spaces", "They are always encrypted"], 0, "A filename beginning with a dot is treated as hidden by many tools.")
    ],
    203: [
        makeQuestion(1, "Which command creates a directory?", ["touch", "mkdir", "cat", "pwd"], 1, "mkdir creates directories."),
        makeQuestion(2, "Which command can create an empty file?", ["touch", "cd", "groups", "uname"], 0, "touch can create an empty file."),
        makeQuestion(3, "Which command copies files?", ["cp", "mv", "rm", "id"], 0, "cp copies files and, with appropriate options, directories."),
        makeQuestion(4, "Which command moves or renames a file?", ["mv", "cat", "pwd", "date"], 0, "mv moves or renames files and directories."),
        makeQuestion(5, "What does rmdir remove?", ["An empty directory", "Any running process", "The root filesystem", "A user account"], 0, "rmdir removes empty directories.")
    ],
    204: [
        makeQuestion(1, "Which command displays file contents?", ["cat", "mkdir", "cd", "chmod"], 0, "cat displays file contents."),
        makeQuestion(2, "Which command displays the beginning of a file?", ["tail", "head", "find", "groups"], 1, "head displays the beginning of a file."),
        makeQuestion(3, "Which command displays the end of a file?", ["head", "tail", "touch", "pwd"], 1, "tail displays the end of a file."),
        makeQuestion(4, "Which command searches for files and directories?", ["find", "whoami", "clear", "uname"], 0, "find searches directory trees."),
        makeQuestion(5, "What does > do in shell redirection?", ["Redirects output and typically overwrites the target", "Lists hidden files", "Changes directory", "Changes ownership"], 0, "The > operator redirects output and typically overwrites the target file.")
    ],
    301: [
        makeQuestion(1, "Which command prints the effective username?", ["whoami", "pwd", "ls", "touch"], 0, "whoami prints the effective username."),
        makeQuestion(2, "Which command displays user and group IDs?", ["id", "cat", "cd", "clear"], 0, "id displays user and group identity information."),
        makeQuestion(3, "Which command lists groups for the current user?", ["groups", "mkdir", "head", "date"], 0, "groups displays group memberships."),
        makeQuestion(4, "Why are groups useful?", ["They help manage shared permissions", "They speed up the CPU", "They replace the kernel", "They hide all files"], 0, "Groups let administrators assign access to multiple users together."),
        makeQuestion(5, "Is Linux designed to support multiple user accounts?", ["Yes", "No", "Only on servers", "Only with a GUI"], 0, "Linux is a multi-user operating system.")
    ],
    302: [
        makeQuestion(1, "What does r represent in permissions?", ["Read", "Rename", "Run as root", "Remove"], 0, "r represents read permission."),
        makeQuestion(2, "What does w represent?", ["Wait", "Write", "Watch", "Web"], 1, "w represents write permission."),
        makeQuestion(3, "What does x represent?", ["Exit", "Execute", "Extract", "Expand"], 1, "x represents execute permission."),
        makeQuestion(4, "Which groups are represented in a standard permission string?", ["Owner, group, others", "Admin, guest, browser", "CPU, RAM, disk", "Root, kernel, shell"], 0, "The permission bits are shown for owner, group and others."),
        makeQuestion(5, "Which command shows a long listing with permissions?", ["ls -l", "pwd", "cd", "echo"], 0, "ls -l displays a detailed listing including permissions.")
    ],
    303: [
        makeQuestion(1, "Which command changes file permissions?", ["chmod", "chown", "pwd", "cat"], 0, "chmod changes permissions."),
        makeQuestion(2, "What is the numeric value for read permission?", ["1", "2", "4", "7"], 2, "Read is represented by 4 in numeric permission notation."),
        makeQuestion(3, "What is the numeric value for write permission?", ["1", "2", "4", "6"], 1, "Write is represented by 2."),
        makeQuestion(4, "What is the numeric value for execute permission?", ["1", "3", "5", "7"], 0, "Execute is represented by 1."),
        makeQuestion(5, "What does chmod +x file add?", ["Execute permission", "A new user", "A directory", "A file extension"], 0, "The +x form adds execute permission.")
    ],
    304: [
        makeQuestion(1, "Which command changes file ownership?", ["chown", "chmod", "whoami", "ls"], 0, "chown changes ownership."),
        makeQuestion(2, "What is the root account?", ["An account with extensive administrative privileges", "A normal text file", "A package manager", "A desktop theme"], 0, "The root account has extensive administrative privileges."),
        makeQuestion(3, "What does sudo do?", ["Runs an authorized command with elevated privileges", "Deletes all users", "Changes the current directory", "Lists files"], 0, "sudo runs a command with elevated privileges when authorized."),
        makeQuestion(4, "Why should sudo be used carefully?", ["Privileged commands can change important system files", "It changes screen brightness", "It makes commands case-insensitive", "It disables all permissions"], 0, "Administrative commands can affect important parts of the system."),
        makeQuestion(5, "Are ownership and permissions the same thing?", ["Yes", "No", "Only for directories", "Only for root"], 1, "Ownership identifies the user and group; permissions define allowed access.")
    ]
};

/* =========================================================
   6. MODULES AND PROGRESS CALCULATIONS
   ========================================================= */

const moduleDefinitions = [
    { id: 1, title: "Linux Fundamentals", description: "Understand Linux, distributions, the terminal and essential commands.", lesson_ids: [101, 102, 103, 104] },
    { id: 2, title: "Linux File System", description: "Explore directories, paths, files and file operations.", lesson_ids: [201, 202, 203, 204] },
    { id: 3, title: "Users and Permissions", description: "Understand users, groups, ownership and access permissions.", lesson_ids: [301, 302, 303, 304] }
];

function isLessonCompleted(lessonId) {
    return mockProgress.completed_lessons.includes(Number(lessonId));
}

function isModuleCompleted(moduleId) {
    const module = moduleDefinitions.find(item => item.id === Number(moduleId));
    return Boolean(module && module.lesson_ids.every(isLessonCompleted));
}

function isModuleUnlocked(moduleId) {
    if (Number(moduleId) === 1) return true;
    return isModuleCompleted(Number(moduleId) - 1);
}

function isLessonUnlocked(lessonId) {
    const lesson = mockLessons[Number(lessonId)];
    if (!lesson) return false;

    const module = moduleDefinitions.find(item => item.id === lesson.module_id);
    if (!module || !isModuleUnlocked(module.id)) return false;

    const position = module.lesson_ids.indexOf(Number(lessonId));
    if (position <= 0) return true;

    return isLessonCompleted(module.lesson_ids[position - 1]);
}

function getModuleStatus(module) {
    if (isModuleCompleted(module.id)) return "completed";
    if (isModuleUnlocked(module.id)) return "unlocked";
    return "locked";
}

function getLessonStatus(lessonId) {
    if (isLessonCompleted(lessonId)) return "completed";
    if (isLessonUnlocked(lessonId)) return "unlocked";
    return "locked";
}

function getAllLessonIds() {
    return moduleDefinitions.flatMap(module => module.lesson_ids);
}

/* =========================================================
   7. MOCK BACKEND REQUEST HANDLER
   ========================================================= */

async function mockRequest(endpoint, options = {}) {
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : {};

    // SIGNUP
    if (endpoint === "/auth/signup" && method === "POST") {
        const existingUser = mockUsers.find(user => user.email === body.email);
        if (existingUser) throw new Error("An account with this email already exists.");

        mockUsers.push({
            name: body.name,
            email: body.email,
            password: body.password
        });
        saveMockUsers();
        return { message: "Account created successfully." };
    }

    // LOGIN
    if (endpoint === "/auth/login" && method === "POST") {
        const user = mockUsers.find(
            item => item.email === body.email && item.password === body.password
        );
        if (!user) throw new Error("Invalid email or password.");

        return {
            token: "mock-token-" + Date.now(),
            name: user.name
        };
    }

    // SETUP GUIDE LIST
    if (endpoint === "/setup-guides" && method === "GET") {
        return mockSetupGuides.map(({ id, title, difficulty, description }) => ({
            id, title, difficulty, description
        }));
    }

    // INDIVIDUAL SETUP GUIDE
    const setupMatch = endpoint.match(/^\/setup-guides\/([a-z-]+)$/);
    if (setupMatch && method === "GET") {
        const guide = mockSetupGuides.find(item => item.id === setupMatch[1]);
        if (!guide) throw new Error("Setup guide not found.");
        return guide;
    }

    // MODULES WITH NESTED LESSONS
    if (endpoint === "/modules" && method === "GET") {
        return moduleDefinitions.map(module => {
            const lessons = module.lesson_ids.map(id => ({
                id,
                title: mockLessons[id].title,
                status: getLessonStatus(id),
                best_score: mockProgress.best_scores[id] ?? null
            }));

            const scores = module.lesson_ids.map(id => mockProgress.best_scores[id] || 0);

            return {
                id: module.id,
                title: module.title,
                description: module.description,
                status: getModuleStatus(module),
                best_score: scores.reduce((sum, score) => sum + score, 0),
                total_questions: module.lesson_ids.length * 5,
                lessons
            };
        });
    }

    // INDIVIDUAL LESSON
    const lessonMatch = endpoint.match(/^\/lessons\/(\d+)$/);
    if (lessonMatch && method === "GET") {
        const id = Number(lessonMatch[1]);
        const lesson = mockLessons[id];

        if (!lesson) throw new Error("Lesson not found.");
        if (!isLessonUnlocked(id)) throw new Error("This lesson is locked.");

        return lesson;
    }

    // COMPLETE CHALLENGE
    const challengeMatch = endpoint.match(/^\/lessons\/(\d+)\/challenge-complete$/);
    if (challengeMatch && method === "POST") {
        const id = Number(challengeMatch[1]);
        if (!mockLessons[id]) throw new Error("Lesson not found.");
        if (!isLessonUnlocked(id)) throw new Error("This lesson is locked.");

        if (!mockProgress.challenge_completed.includes(id)) {
            mockProgress.challenge_completed.push(id);
            saveMockProgress();
        }
        return { message: "Challenge completed successfully.", completed: true };
    }

    // GET QUIZ QUESTIONS — hide correct answers
    const questionMatch = endpoint.match(/^\/lessons\/(\d+)\/questions$/);
    if (questionMatch && method === "GET") {
        const id = Number(questionMatch[1]);
        if (!mockQuestions[id]) throw new Error("Questions not found.");
        if (!isLessonUnlocked(id)) throw new Error("This lesson is locked.");

        return mockQuestions[id].map(question => ({
            id: question.id,
            question: question.question,
            options: question.options
        }));
    }

    // SUBMIT LESSON QUIZ
    const quizMatch = endpoint.match(/^\/lessons\/(\d+)\/quiz$/);
    if (quizMatch && method === "POST") {
        const id = Number(quizMatch[1]);
        const questions = mockQuestions[id];

        if (!questions) throw new Error("Quiz not found.");
        if (!mockProgress.challenge_completed.includes(id)) {
            throw new Error("Complete the lesson challenge before taking the quiz.");
        }

        let score = 0;
        const results = questions.map(question => {
            const selected = body.answers?.[question.id];
            const isCorrect = Number(selected) === question.correct_option;
            if (isCorrect) score++;

            return {
                question_id: question.id,
                selected_option: selected === undefined ? null : Number(selected),
                correct_option: question.correct_option,
                is_correct: isCorrect,
                explanation: question.explanation
            };
        });

        const passed = score >= 3;
        mockProgress.best_scores[id] = Math.max(mockProgress.best_scores[id] || 0, score);

        if (passed && !mockProgress.completed_lessons.includes(id)) {
            mockProgress.completed_lessons.push(id);
        }

        saveMockProgress();

        return { score, total: questions.length, passed, results };
    }

    // MODULE ASSESSMENT QUESTIONS — prototype placeholder
    const moduleAssessmentQuestionsMatch = endpoint.match(/^\/modules\/(\d+)\/assessment\/questions$/);
    if (moduleAssessmentQuestionsMatch && method === "GET") {
        const moduleId = Number(moduleAssessmentQuestionsMatch[1]);
        const module = moduleDefinitions.find(item => item.id === moduleId);
        if (!module) throw new Error("Module not found.");
        if (!isModuleCompleted(moduleId)) throw new Error("Complete all lessons first.");

        return [{
            id: 1,
            question: "Which topic did this module teach you?",
            options: ["A topic from this module", "A topic from another course", "None of these", "All commands are identical"]
        }];
    }

    // MODULE ASSESSMENT SUBMISSION — placeholder until assessment content is authored
    const moduleAssessmentMatch = endpoint.match(/^\/modules\/(\d+)\/assessment$/);
    if (moduleAssessmentMatch && method === "POST") {
        const moduleId = Number(moduleAssessmentMatch[1]);
        if (!isModuleCompleted(moduleId)) throw new Error("Complete all lessons first.");

        mockProgress.completed_module_assessments =
            [...new Set([...mockProgress.completed_module_assessments, moduleId])];
        saveMockProgress();

        return { passed: true, score: 1, total: 1, message: "Module assessment completed." };
    }

    // FINAL ASSESSMENT — placeholder until practical task checker is built
    if (endpoint === "/final-assessment" && method === "GET") {
        if (!moduleDefinitions.every(module => isModuleCompleted(module.id))) {
            throw new Error("Complete all modules first.");
        }
        return {
            title: "Linux Workspace Challenge",
            instructions: "Create and organize a project workspace using the commands learned throughout the course."
        };
    }

    if (endpoint === "/final-assessment/submit" && method === "POST") {
        if (!moduleDefinitions.every(module => isModuleCompleted(module.id))) {
            throw new Error("Complete all modules first.");
        }
        mockProgress.final_assessment_completed = true;
        saveMockProgress();
        return { completed: true, message: "Final assessment submitted." };
    }

    // LEARNER PROGRESS
    if (endpoint === "/progress" && method === "GET") {
        const allIds = getAllLessonIds();
        const completedCount = mockProgress.completed_lessons.length;
        const nextLessonId = allIds.find(id => !isLessonCompleted(id) && isLessonUnlocked(id));

        return {
            completed_lessons: completedCount,
            total_lessons: allIds.length,
            completed_modules: moduleDefinitions.filter(module => isModuleCompleted(module.id)).length,
            total_modules: moduleDefinitions.length,
            total_score: Object.values(mockProgress.best_scores).reduce((sum, score) => sum + score, 0),
            continue_lesson_id: nextLessonId ?? null
        };
    }

    throw new Error("Endpoint not found: " + endpoint);
}

/* =========================================================
   8. FRONTEND API FUNCTIONS
   Pages call these functions instead of calling fetch directly.
   ========================================================= */

const api = {
    signup(data) {
        return request("/auth/signup", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    login(data) {
        return request("/auth/login", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    getSetupGuides() {
        return request("/setup-guides");
    },

    getSetupGuide(id) {
        return request(`/setup-guides/${id}`);
    },

    getModules() {
        return request("/modules");
    },

    getLesson(id) {
        return request(`/lessons/${id}`);
    },

    completeChallenge(id) {
        return request(`/lessons/${id}/challenge-complete`, {
            method: "POST",
            body: JSON.stringify({})
        });
    },

    getQuestions(id) {
        return request(`/lessons/${id}/questions`);
    },

    submitQuiz(id, answers) {
        return request(`/lessons/${id}/quiz`, {
            method: "POST",
            body: JSON.stringify({ answers })
        });
    },

    getModuleAssessmentQuestions(moduleId) {
        return request(`/modules/${moduleId}/assessment/questions`);
    },

    submitModuleAssessment(moduleId, answers) {
        return request(`/modules/${moduleId}/assessment`, {
            method: "POST",
            body: JSON.stringify({ answers })
        });
    },

    getFinalAssessment() {
        return request("/final-assessment");
    },

    submitFinalAssessment(data = {}) {
        return request("/final-assessment/submit", {
            method: "POST",
            body: JSON.stringify(data)
        });
    },

    getProgress() {
        return request("/progress");
    }
};