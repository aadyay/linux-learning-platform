
// ==========================================
// LINUX LEARNING PLATFORM - VIRTUAL TERMINAL
// This terminal simulates commands.
// It NEVER executes commands on the real computer.
// ==========================================


// 1. VIRTUAL FILE SYSTEM

function createInitialFileSystem() {
    return {
        type: "directory",
        children: {
            home: {
                type: "directory",
                children: {
                    user: {
                        type: "directory",
                        children: {
                            docs: {
                                type: "directory",
                                children: {}
                            },
                            "notes.txt": {
                                type: "file",
                                content: "Welcome to Linux!",
                                permissions: {
                                    read: true,
                                    write: true,
                                    execute: false
                                }
                            }
                        }
                    }
                }
            }
        }
    };
}

let fileSystem = createInitialFileSystem();

let currentPath = "/home/user";
let lastCommand = "";
let lastOutput = "";
let commandHistory = [];
let historyIndex = 0;


// 2. RESET THE FILE SYSTEM

function resetFileSystem() {
    fileSystem = createInitialFileSystem();
    currentPath = "/home/user";
    lastCommand = "";
    lastOutput = "";
    commandHistory = [];
    historyIndex = 0;
}


// 3. NORMALIZE A PATH

function normalizePath(path) {
    if (!path || path === "~") {
        return "/home/user";
    }

    let parts;

    if (path.startsWith("/")) {
        parts = [];
    } else {
        parts = currentPath.split("/").filter(Boolean);
    }

    const newParts = path.split("/");

    for (const part of newParts) {
        if (part === "" || part === ".") {
            continue;
        }

        if (part === "..") {
            parts.pop();
        } else {
            parts.push(part);
        }
    }

    return "/" + parts.join("/");
}


// 4. FIND A FILE OR DIRECTORY

function getNode(path) {
    const normalized = normalizePath(path);

    if (normalized === "/") {
        return fileSystem;
    }

    const parts = normalized.split("/").filter(Boolean);

    let currentNode = fileSystem;

    for (const part of parts) {
        if (
            currentNode.type !== "directory" ||
            !currentNode.children[part]
        ) {
            return null;
        }

        currentNode = currentNode.children[part];
    }

    return currentNode;
}


// 5. FIND A DIRECTORY AND ITS ITEM NAME

function getParentAndName(path) {
    const normalized = normalizePath(path);

    if (normalized === "/") {
        return null;
    }

    const parts = normalized.split("/").filter(Boolean);
    const name = parts.pop();

    const parentPath = "/" + parts.join("/");
    const parent = getNode(parentPath);

    if (!parent || parent.type !== "directory") {
        return null;
    }

    return { parent, name };
}


// 6. FORMAT PERMISSIONS

function getPermissionString(node) {
    if (node.type === "directory") {
        return "d";
    }

    const permissions = node.permissions;

    return (
        "-" +
        (permissions.read ? "r" : "-") +
        (permissions.write ? "w" : "-") +
        (permissions.execute ? "x" : "-")
    );
}


// 7. COMMAND: PWD

function commandPwd() {
    return currentPath;
}


// 8. COMMAND: LS

function commandLs(args) {
    let longFormat = false;
    let targetPath = currentPath;

    if (args[0] === "-l") {
        longFormat = true;

        if (args[1]) {
            targetPath = args[1];
        }
    } else if (args[0]) {
        targetPath = args[0];
    }

    const node = getNode(targetPath);

    if (!node) {
        return "ls: cannot access '" + targetPath + "': No such file or directory";
    }

    if (node.type === "file") {
        return node.name || targetPath;
    }

    const names = Object.keys(node.children);

    if (names.length === 0) {
        return "Directory is empty.";
    }

    if (!longFormat) {
        return names.join("    ");
    }

    return names.map(name => {
        const child = node.children[name];
        return getPermissionString(child) + " " + name;
    }).join("\n");
}


// 9. COMMAND: CD

function commandCd(args) {
    const targetPath = args[0] || "/home/user";
    const node = getNode(targetPath);

    if (!node) {
        return "cd: No such directory: " + targetPath;
    }

    if (node.type !== "directory") {
        return "cd: Not a directory: " + targetPath;
    }

    currentPath = normalizePath(targetPath);

    return "";
}


// 10. COMMAND: MKDIR

function commandMkdir(args) {
    if (!args[0]) {
        return "mkdir: missing directory name";
    }

    const result = getParentAndName(args[0]);

    if (!result) {
        return "mkdir: parent directory does not exist";
    }

    const { parent, name } = result;

    if (parent.children[name]) {
        return "mkdir: cannot create directory '" + name + "': File exists";
    }

    parent.children[name] = {
        type: "directory",
        children: {}
    };

    return "Directory created: " + name;
}


// 11. COMMAND: TOUCH

function commandTouch(args) {
    if (!args[0]) {
        return "touch: missing file name";
    }

    const result = getParentAndName(args[0]);

    if (!result) {
        return "touch: parent directory does not exist";
    }

    const { parent, name } = result;

    if (parent.children[name]) {
        return "File already exists: " + name;
    }

    parent.children[name] = {
        type: "file",
        content: "",
        permissions: {
            read: true,
            write: true,
            execute: false
        }
    };

    return "File created: " + name;
}


// 12. COMMAND: CAT

function commandCat(args) {
    if (!args[0]) {
        return "cat: missing file name";
    }

    const node = getNode(args[0]);

    if (!node) {
        return "cat: " + args[0] + ": No such file or directory";
    }

    if (node.type !== "file") {
        return "cat: " + args[0] + ": Is a directory";
    }

    return node.content || "(This file is empty)";
}


// 13. COMMAND: RM

function commandRm(args) {
    if (!args[0]) {
        return "rm: missing file name";
    }

    const result = getParentAndName(args[0]);

    if (!result) {
        return "rm: cannot find file";
    }

    const { parent, name } = result;
    const node = parent.children[name];

    if (!node) {
        return "rm: cannot remove '" + name + "': No such file";
    }

    if (node.type === "directory") {
        return "rm: cannot remove directory '" + name + "'";
    }

    delete parent.children[name];

    return "File removed: " + name;
}


// 14. COMMAND: ECHO

function commandEcho(rawCommand) {
    const match = rawCommand.match(/^echo\s+(.+?)\s*>\s*(.+)$/);

    if (match) {
        let content = match[1].trim();
        const fileName = match[2].trim();

        content = content.replace(/^["']|["']$/g, "");

        const node = getNode(fileName);

        if (node && node.type !== "file") {
            return "echo: " + fileName + ": Is a directory";
        }

        if (node) {
            node.content = content;
            return "Text written to " + fileName;
        }

        const result = getParentAndName(fileName);

        if (!result) {
            return "echo: parent directory does not exist";
        }

        result.parent.children[result.name] = {
            type: "file",
            content: content,
            permissions: {
                read: true,
                write: true,
                execute: false
            }
        };

        return "File created and text written to " + fileName;
    }

    let output = rawCommand.substring(4).trim();
    output = output.replace(/^["']|["']$/g, "");

    return output;
}


// 15. COMMAND: CHMOD

function commandChmod(args) {
    if (args.length < 2) {
        return "chmod: usage: chmod +x/-x filename";
    }

    const permission = args[0];
    const fileName = args[1];

    const node = getNode(fileName);

    if (!node) {
        return "chmod: cannot access '" + fileName + "': No such file";
    }

    if (node.type !== "file") {
        return "chmod: expected a file";
    }

    if (permission === "+x") {
        node.permissions.execute = true;
        return "Execute permission added to " + fileName;
    }

    if (permission === "-x") {
        node.permissions.execute = false;
        return "Execute permission removed from " + fileName;
    }

    return "chmod: supported options are +x and -x";
}


// 16. COMMAND: HELP

function commandHelp() {
    return `Available commands:

pwd                 Show current directory
ls                  List files and folders
ls -l               List with permissions
cd folder           Change directory
mkdir folder        Create a directory
touch file.txt      Create a file
cat file.txt        Read a file
rm file.txt         Remove a file
echo Hello          Display text
echo Hello > a.txt  Write text to a file
chmod +x file.txt   Add execute permission
chmod -x file.txt   Remove execute permission
clear               Clear terminal
help                Show this list`;
}


// 17. MAIN COMMAND RUNNER

function runCommand(input) {
    const rawCommand = input.trim();

    if (!rawCommand) {
        return "";
    }

    lastCommand = rawCommand;
    commandHistory.push(rawCommand);
    historyIndex = commandHistory.length;

    const parts = rawCommand.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    let output = "";

    switch (command) {
        case "pwd":
            output = commandPwd();
            break;

        case "ls":
            output = commandLs(args);
            break;

        case "cd":
            output = commandCd(args);
            break;

        case "mkdir":
            output = commandMkdir(args);
            break;

        case "touch":
            output = commandTouch(args);
            break;

        case "cat":
            output = commandCat(args);
            break;

        case "rm":
            output = commandRm(args);
            break;

        case "echo":
            output = commandEcho(rawCommand);
            break;

        case "chmod":
            output = commandChmod(args);
            break;

        case "help":
            output = commandHelp();
            break;

        case "clear":
            clearTerminalDisplay();
            output = "";
            break;

        default:
            output = command + ": command not found. Type 'help' for available commands.";
    }

    lastOutput = output;

    return output;
}


// 18. CHECK WHETHER THE STUDENT COMPLETED A GOAL

function checkGoal(check) {
    if (!check) {
        return false;
    }

    if (check.ran_command) {
        const expected = check.ran_command;
        const actual = lastCommand.trim();

        if (expected.includes(" ")) {
            if (actual !== expected) {
                return false;
            }
        } else {
            if (actual.split(/\s+/)[0] !== expected) {
                return false;
            }
        }
    }

    if (check.cwd_is) {
        if (currentPath !== normalizePath(check.cwd_is)) {
            return false;
        }
    }

    if (check.path_exists) {
        if (!getNode(check.path_exists)) {
            return false;
        }
    }

    if (check.file_executable) {
        const node = getNode(check.file_executable);

        if (!node || node.type !== "file" || !node.permissions.execute) {
            return false;
        }
    }

    if (check.output_contains) {
        if (!lastOutput.includes(check.output_contains)) {
            return false;
        }
    }

    return true;
}


// 19. TERMINAL DISPLAY FUNCTIONS

function displayTerminalLine(text, className = "") {
    const output = document.getElementById("terminalOutput");

    if (!output) {
        return;
    }

    const line = document.createElement("div");
    line.className = "terminal-line " + className;
    line.textContent = text;

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}


function clearTerminalDisplay() {
    const output = document.getElementById("terminalOutput");

    if (output) {
        output.innerHTML = "";
    }
}


// 20. INITIALIZE TERMINAL

function initializeTerminal() {
    const form = document.getElementById("terminalForm");
    const input = document.getElementById("terminalInput");

    if (!form || !input) {
        return;
    }

    resetFileSystem();
    clearTerminalDisplay();

    displayTerminalLine("LinuxLearn simulated terminal", "terminal-welcome");
    displayTerminalLine("Type 'help' to see available commands.");
    displayTerminalLine("");

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const command = input.value.trim();

        if (!command) {
            return;
        }

        displayTerminalLine(
            "user@linuxlearn:" + currentPath + "$ " + command,
            "terminal-command"
        );

        const result = runCommand(command);

        if (result) {
            displayTerminalLine(result, "terminal-result");
        }

        input.value = "";
        input.focus();
    });

    input.addEventListener("keydown", function(event) {
        if (event.key === "ArrowUp") {
            event.preventDefault();

            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            }
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = "";
            }
        }
    });
}
