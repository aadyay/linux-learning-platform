
// ==========================================
// LESSON PAGE LOGIC
// ==========================================

// 1. GET LESSON ID FROM URL

const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

let lessonData = null;
let currentStepIndex = 0;
let challengeCompleted = false;


// ==========================================
// 2. START LESSON
// ==========================================

if (requireLogin()) {
    initializeLesson();
}


async function initializeLesson() {
    try {
        if (!lessonId) {
            window.location.href = "dashboard.html";
            return;
        }

        // Get all modules and find the selected lesson.

        const modules = await api.getModules();

        let selectedModule = null;
        let selectedLesson = null;

        for (const module of modules) {
            const matchingLesson = (module.lessons || []).find(
                lesson => String(lesson.id) === String(lessonId)
            );

            if (matchingLesson) {
                selectedModule = module;
                selectedLesson = matchingLesson;
                break;
            }
        }

        // Check whether the lesson exists.

        if (!selectedLesson) {
            alert("Lesson not found.");
            window.location.href = "dashboard.html";
            return;
        }

        // Check whether the lesson is unlocked.

        if (selectedLesson.status === "locked") {
            alert("Complete the previous lesson to unlock this one.");
            window.location.href = "dashboard.html";
            return;
        }

        // Load lesson content.

        lessonData = await api.getLesson(lessonId);

        // Restore previously completed challenge status.

        const progress = await api.getProgress();

        challengeCompleted = (
            progress.challenge_completed || []
        ).some(id => String(id) === String(lessonId));

        // Display lesson information.

        document.getElementById("lessonTitle").textContent =
            lessonData.title;

        document.getElementById("lessonMission").textContent =
            lessonData.mission || "";

        // Display theory and learning steps.

        renderTheory();
        renderStepList();

        // Initialize simulated terminal.

        initializeTerminal();

        // Restore challenge status.

        updateChallengeStatus();

        // Display first step.

        showStep(0);

    } catch (error) {
        console.error("Lesson loading error:", error);

        document.getElementById("lessonTitle").textContent =
            "Unable to load lesson";

        document.getElementById("lessonMission").textContent =
            error.message;
    }
}


// ==========================================
// 3. RENDER THEORY CONTENT
// ==========================================

function renderTheory() {
    const container = document.getElementById("theoryContainer");

    container.innerHTML = "";

    const theory = lessonData.theory || [];

    if (theory.length === 0) {
        container.textContent = "No theory content available yet.";
        return;
    }

    theory.forEach((section, index) => {

        const sectionElement = document.createElement("div");
        sectionElement.className = "theory-section";

        // Support both plain text and object sections.

        if (typeof section === "string") {
            const paragraph = document.createElement("p");
            paragraph.textContent = section;

            sectionElement.appendChild(paragraph);
            container.appendChild(sectionElement);

            return;
        }

        // Section heading.

        const heading = document.createElement("h3");

        heading.textContent =
            section.heading ||
            section.title ||
            section.name ||
            `Concept ${index + 1}`;

        sectionElement.appendChild(heading);

        // Section explanation.

        const explanation =
            section.content ||
            section.text ||
            section.description ||
            "";

        if (Array.isArray(explanation)) {
            explanation.forEach(item => {
                const paragraph = document.createElement("p");
                paragraph.textContent = item;

                sectionElement.appendChild(paragraph);
            });

        } else if (explanation) {
            const paragraph = document.createElement("p");
            paragraph.textContent = explanation;

            sectionElement.appendChild(paragraph);
        }

        // Key points.

        const points =
            section.key_points ||
            section.points ||
            section.bullets ||
            [];

        if (Array.isArray(points) && points.length > 0) {
            const list = document.createElement("ul");

            points.forEach(point => {
                const listItem = document.createElement("li");
                listItem.textContent = point;

                list.appendChild(listItem);
            });

            sectionElement.appendChild(list);
        }

        // Example, if available.

        if (section.example) {
            const example = document.createElement("div");

            example.className = "code-example";
            example.textContent = section.example;

            sectionElement.appendChild(example);
        }

        container.appendChild(sectionElement);
    });
}


// ==========================================
// 4. DISPLAY LEARNING STEPS
// ==========================================

function renderStepList() {
    const container = document.getElementById("lessonSteps");

    container.innerHTML = "";

    lessonData.steps.forEach((step, index) => {

        const item = document.createElement("button");

        item.className = "lesson-step";

        item.textContent =
            `${index + 1}. ${step.kind.toUpperCase()}`;

        if (index === currentStepIndex) {
            item.classList.add("active");
        }

        item.addEventListener("click", function() {

            // Learners cannot skip ahead.

            if (index <= currentStepIndex) {
                showStep(index);
            }

        });

        container.appendChild(item);
    });
}


// ==========================================
// 5. DISPLAY INDIVIDUAL STEP
// ==========================================

function showStep(index) {

    if (
        !lessonData ||
        index < 0 ||
        index >= lessonData.steps.length
    ) {
        return;
    }

    currentStepIndex = index;

    const step = lessonData.steps[index];

    document.getElementById("stepType").textContent =
        step.kind.toUpperCase();

    document.getElementById("stepTitle").textContent =
        "Step " + (step.step_number || index + 1);

    document.getElementById("stepText").textContent =
        step.text || "";

    // Display command example and output.

    document.getElementById("stepExample").textContent =
        step.example_command
            ? step.example_command +
              "\n" +
              (step.example_output || "")
            : "";

    // Clear old messages.

    document.getElementById("stepHint").textContent = "";

    document.getElementById("stepFeedback").textContent = "";

    document.getElementById("stepFeedback").className = "";

    // Show or hide hint button.

    document.getElementById("hintButton").style.display =
        step.hint ? "inline-block" : "none";

    // Show check button only for practice and challenge steps.

    document.getElementById("checkButton").style.display =
        step.kind === "try" || step.kind === "challenge"
            ? "inline-block"
            : "none";

    // Navigation controls.

    document.getElementById("previousButton").disabled =
        index === 0;

    document.getElementById("nextButton").disabled =
        index === lessonData.steps.length - 1;

    renderStepList();

    updateNavigation();

    updateLessonProgress();
}


// ==========================================
// 6. LESSON PROGRESS INDICATOR
// ==========================================

function updateLessonProgress() {

    const totalSteps = lessonData.steps.length;

    const completedSteps = currentStepIndex + 1;

    const percentage = Math.round(
        (completedSteps / totalSteps) * 100
    );

    const progressBar = document.getElementById("lessonProgressBar");

    const progressText = document.getElementById("lessonProgressText");

    if (progressBar) {
        progressBar.style.width = percentage + "%";
    }

    if (progressText) {
        progressText.textContent =
            `${completedSteps} of ${totalSteps} steps`;
    }
}


// ==========================================
// 7. NEXT AND PREVIOUS BUTTONS
// ==========================================

document.getElementById("nextButton").addEventListener(
    "click",
    async function() {

        const step = lessonData.steps[currentStepIndex];

        // Practice and challenge steps must be completed first.

        if (
            step.kind === "try" ||
            step.kind === "challenge"
        ) {

            if (!checkGoal(step.check)) {

                document.getElementById("stepFeedback").textContent =
                    "Complete the task in the terminal before moving ahead.";

                document.getElementById("stepFeedback").className =
                    "error-message";

                return;
            }

            // Save challenge completion.

            if (step.kind === "challenge") {
                await completeLessonChallenge();
            }
        }

        showStep(currentStepIndex + 1);

    }
);


document.getElementById("previousButton").addEventListener(
    "click",
    function() {
        showStep(currentStepIndex - 1);
    }
);


// ==========================================
// 8. SHOW HINT
// ==========================================

document.getElementById("hintButton").addEventListener(
    "click",
    function() {

        const step = lessonData.steps[currentStepIndex];

        document.getElementById("stepHint").textContent =
            step.hint || "No hint available.";

    }
);


// ==========================================
// 9. CHECK COMMAND
// ==========================================

document.getElementById("checkButton").addEventListener(
    "click",
    async function() {

        const step = lessonData.steps[currentStepIndex];

        const feedback = document.getElementById("stepFeedback");

        if (checkGoal(step.check)) {

            feedback.textContent = "Correct! Great work.";

            feedback.className = "success-message";

            if (step.kind === "challenge") {
                await completeLessonChallenge();
            }

        } else {

            feedback.textContent =
                "Not quite! Check the instruction and try again.";

            feedback.className = "error-message";
        }

    }
);


// ==========================================
// 10. SAVE CHALLENGE COMPLETION
// ==========================================

async function completeLessonChallenge() {

    if (challengeCompleted) {
        return;
    }

    try {

        await api.completeChallenge(lessonId);

        challengeCompleted = true;

        updateChallengeStatus();

        document.getElementById("stepFeedback").textContent =
            "Challenge completed successfully! You can now take the quiz.";

        document.getElementById("stepFeedback").className =
            "success-message";

    } catch (error) {

        document.getElementById("stepFeedback").textContent =
            "Could not save challenge progress: " + error.message;

        document.getElementById("stepFeedback").className =
            "error-message";
    }
}


// ==========================================
// 11. UPDATE CHALLENGE STATUS
// ==========================================

function updateChallengeStatus() {

    const status = document.getElementById("challengeStatus");

    const quizButton = document.getElementById("quizButton");

    if (challengeCompleted) {

        status.textContent =
            "Challenge completed! Your quiz is unlocked.";

        status.className = "success-message";

        quizButton.disabled = false;

    } else {

        status.textContent =
            "Complete the challenge step to unlock your quiz.";

        quizButton.disabled = true;
    }
}


// ==========================================
// 12. QUIZ BUTTON
// ==========================================

document.getElementById("quizButton").addEventListener(
    "click",
    function() {

        if (challengeCompleted) {

            window.location.href =
                "quiz.html?id=" + encodeURIComponent(lessonId);

        }

    }
);


// ==========================================
// 13. UPDATE NAVIGATION
// ==========================================

function updateNavigation() {

    const step = lessonData.steps[currentStepIndex];

    const nextButton = document.getElementById("nextButton");

    if (step.kind === "challenge") {

        nextButton.textContent = "Finish challenge";

    } else if (
        currentStepIndex === lessonData.steps.length - 1
    ) {

        nextButton.textContent = "Lesson complete";

    } else {

        nextButton.textContent = "Next";

    }
}
