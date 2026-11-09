
// ==========================================
// LINUXLEARN - INTERACTIVE ROADMAP DASHBOARD
// ==========================================


// 1. START DASHBOARD

if (requireLogin()) {
    initializeDashboard();
}


// ==========================================
// 2. INITIALIZE
// ==========================================

async function initializeDashboard() {
    try {

        const [modules, progress] = await Promise.all([
            api.getModules(),
            api.getProgress()
        ]);

        displayWelcomeMessage();
        displayOverallProgress(modules, progress);
        renderRoadmap(modules);
        setupContinueButton(progress, modules);

    } catch (error) {

        console.error("Dashboard error:", error);

        document.getElementById("moduleContainer").innerHTML = `
            <div class="roadmap-error">
                <h3>Something went wrong</h3>
                <p>${escapeHTML(error.message)}</p>
                <button onclick="initializeDashboard()">
                    Try again
                </button>
            </div>
        `;
    }
}


// ==========================================
// 3. WELCOME MESSAGE
// ==========================================

function displayWelcomeMessage() {

    const userName = localStorage.getItem("userName") || "Learner";

    const nameElement = document.getElementById("userName");

    if (nameElement) {
        nameElement.textContent = userName;
    }
}


// ==========================================
// 4. OVERALL PROGRESS
// ==========================================

function displayOverallProgress(modules, progress) {

    const completedLessons = progress.completed_lessons || [];

    const allLessons = modules.flatMap(
        module => module.lessons || []
    );

    const totalLessons = allLessons.length;

    const completedCount = completedLessons.length;

    const percentage = totalLessons
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;


    // Main progress bar

    const progressBar = document.getElementById("progressBar");

    const progressText = document.getElementById("progressText");

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (progressText) {
        progressText.textContent = `${percentage}% completed`;
    }


    // Completed modules

    const completedModules = modules.filter(
        module => module.status === "completed"
    ).length;

    const completedCountElement =
        document.getElementById("completedCount");

    if (completedCountElement) {
        completedCountElement.textContent = completedModules;
    }


    // Total modules

    const totalModulesElement =
        document.getElementById("totalModules");

    if (totalModulesElement) {
        totalModulesElement.textContent = modules.length;
    }


    // Average quiz score

    const scores = Object.values(progress.best_scores || {})
        .map(Number)
        .filter(score => Number.isFinite(score));

    const averageScore = scores.length
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) /
            scores.length
        )
        : 0;

    const totalScoreElement =
        document.getElementById("totalScore");

    if (totalScoreElement) {
        totalScoreElement.textContent = `${averageScore}%`;
    }


    // Progress message

    const scoreText = document.getElementById("scoreText");

    if (scoreText) {

        if (percentage === 100) {
            scoreText.textContent =
                "Amazing! You have completed your entire Linux learning journey.";

        } else if (percentage === 0) {
            scoreText.textContent =
                "Your journey is just beginning. Complete your first lesson!";

        } else {
            scoreText.textContent =
                `You've completed ${completedCount} out of ${totalLessons} lessons. Keep going!`;
        }
    }
}


// ==========================================
// 5. GENERATE THE ROADMAP
// ==========================================

function renderRoadmap(modules) {

    const container = document.getElementById("moduleContainer");

    if (!container) return;

    container.innerHTML = "";

    modules.forEach((module, moduleIndex) => {

        const lessons = module.lessons || [];

        const completedLessons = lessons.filter(
            lesson => lesson.status === "completed"
        ).length;

        const moduleStatus = module.status || "locked";

        const modulePercentage = lessons.length
            ? Math.round(
                (completedLessons / lessons.length) * 100
            )
            : 0;


        // Create module section

        const moduleSection = document.createElement("section");

        moduleSection.className =
            `roadmap-module module-${moduleStatus}`;


        // Module heading

        moduleSection.innerHTML = `

            <div class="module-checkpoint">

                <div class="checkpoint-number">
                    ${String(moduleIndex + 1).padStart(2, "0")}
                </div>

                <div class="checkpoint-info">

                    <span class="checkpoint-label">
                        MODULE ${moduleIndex + 1}
                    </span>

                    <h3>${escapeHTML(module.title)}</h3>

                    <p>${escapeHTML(module.description || "")}</p>

                </div>

                <span class="checkpoint-status ${moduleStatus}">
                    ${getStatusLabel(moduleStatus)}
                </span>

            </div>


            <div class="module-roadmap-progress">

                <div class="module-roadmap-track">

                    <div
                        class="module-roadmap-fill"
                        style="width: ${modulePercentage}%"
                    ></div>

                </div>

                <span>
                    ${completedLessons}/${lessons.length} lessons completed
                </span>

            </div>


            <div class="roadmap-lessons">

                ${lessons.map((lesson, lessonIndex) =>
                    createRoadmapNode(lesson, lessonIndex)
                ).join("")}

            </div>

        `;

        container.appendChild(moduleSection);
    });

    attachRoadmapListeners();
}


// ==========================================
// 6. CREATE ROADMAP LESSON NODES
// ==========================================

function createRoadmapNode(lesson, index) {

    const status = lesson.status || "locked";

    const isLocked = status === "locked";

    const isCompleted = status === "completed";

    let nodeSymbol = String(index + 1);

    let buttonText = "Start lesson";

    if (isCompleted) {
        nodeSymbol = "✓";
        buttonText = "Review lesson";

    } else if (isLocked) {
        nodeSymbol = "🔒";
        buttonText = "Locked";
    }

    const score = lesson.best_score !== undefined &&
        lesson.best_score !== null
        ? `<span class="node-score">Best score: ${escapeHTML(String(lesson.best_score))}%</span>`
        : "";


    return `

        <div class="roadmap-node-wrapper ${status}">

            <div class="roadmap-node ${status}">

                <button
                    class="node-circle"
                    data-lesson-id="${escapeHTML(String(lesson.id))}"
                    ${isLocked ? "disabled" : ""}
                    aria-label="${escapeHTML(lesson.title)}"
                    title="${escapeHTML(lesson.title)}"
                >

                    ${nodeSymbol}

                </button>

                <div class="node-details">

                    <span class="node-id">
                        LESSON ${escapeHTML(String(lesson.id))}
                    </span>

                    <h4>${escapeHTML(lesson.title)}</h4>

                    <span class="node-status">
                        ${getStatusLabel(status)}
                    </span>

                    ${score}

                    <button
                        class="node-action"
                        data-lesson-id="${escapeHTML(String(lesson.id))}"
                        ${isLocked ? "disabled" : ""}
                    >
                        ${buttonText}
                    </button>

                </div>

            </div>

        </div>

    `;
}


// ==========================================
// 7. ROADMAP NODE CLICK EVENTS
// ==========================================

function attachRoadmapListeners() {

    const buttons = document.querySelectorAll(
        ".node-circle, .node-action"
    );

    buttons.forEach(button => {

        button.addEventListener("click", function() {

            const lessonId = this.dataset.lessonId;

            if (!lessonId || this.disabled) return;

            window.location.href =
                `lesson.html?id=${encodeURIComponent(lessonId)}`;

        });

    });
}


// ==========================================
// 8. CONTINUE LEARNING
// ==========================================

function setupContinueButton(progress, modules) {

    const continueButton =
        document.getElementById("continueButton");

    if (!continueButton) return;

    let nextLessonId = progress.continue_lesson_id;


    // Find the first available lesson if API
    // has not provided a continue lesson ID.

    if (!nextLessonId) {

        for (const module of modules) {

            const nextLesson = (module.lessons || []).find(
                lesson => lesson.status === "unlocked"
            );

            if (nextLesson) {
                nextLessonId = nextLesson.id;
                break;
            }
        }
    }


    // If all lessons are completed, allow revision.

    if (!nextLessonId) {

        for (const module of modules) {

            const completedLesson = (module.lessons || []).find(
                lesson => lesson.status === "completed"
            );

            if (completedLesson) {
                nextLessonId = completedLesson.id;
                break;
            }
        }
    }


    if (nextLessonId) {

        continueButton.disabled = false;

        continueButton.addEventListener("click", function() {

            window.location.href =
                `lesson.html?id=${encodeURIComponent(nextLessonId)}`;

        });

    } else {

        continueButton.disabled = true;

        continueButton.textContent = "No lessons available";
    }
}


// ==========================================
// 9. STATUS LABELS
// ==========================================

function getStatusLabel(status) {

    const labels = {
        completed: "COMPLETED",
        unlocked: "AVAILABLE",
        locked: "LOCKED"
    };

    return labels[status] || status.toUpperCase();
}


// ==========================================
// 10. HTML ESCAPING
// ==========================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}
