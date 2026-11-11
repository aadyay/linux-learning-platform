
// ==========================================
// QUIZ PAGE LOGIC
// ==========================================

// 1. GET LESSON ID

const quizParams = new URLSearchParams(window.location.search);
const quizLessonId = quizParams.get("id");

let questions = [];
let selectedAnswers = {};
let quizSubmitted = false;
let quizPassed = false;

let selectedLesson = null;
let selectedModule = null;
let nextLesson = null;


// 2. INITIALIZE QUIZ

if (requireLogin()) {
    initializeQuiz();
}


async function initializeQuiz() {
    try {
        if (!quizLessonId) {
            throw new Error("No lesson ID was provided.");
        }

        // Get all modules
        const modules = await api.getModules();

        // Find the module containing this lesson
        selectedModule = modules.find(module =>
            Array.isArray(module.lessons) &&
            module.lessons.some(lesson =>
                String(lesson.id) === String(quizLessonId)
            )
        );

        if (!selectedModule) {
            throw new Error(
                "Module containing lesson " + quizLessonId + " was not found."
            );
        }

        // Find the actual lesson
        selectedLesson = selectedModule.lessons.find(lesson =>
            String(lesson.id) === String(quizLessonId)
        );

        if (!selectedLesson || selectedLesson.status === "locked") {
            throw new Error("This lesson is locked.");
        }

        // Find the next lesson in the module sequence
        const allLessons = modules.flatMap(module =>
            Array.isArray(module.lessons) ? module.lessons : []
        );

        const currentIndex = allLessons.findIndex(lesson =>
            String(lesson.id) === String(quizLessonId)
        );

        if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
            nextLesson = allLessons[currentIndex + 1];
        }

        // Load quiz questions
        questions = await api.getQuestions(quizLessonId);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("No quiz questions found.");
        }

        document.getElementById("quizTitle").textContent =
            (selectedLesson.title || selectedModule.title) + " - Quiz";

        renderQuestions();

    } catch (error) {
        console.error("Quiz loading error:", error);

        document.getElementById("questionCount").textContent =
            "Unable to load quiz: " + error.message;

        document.getElementById("quizMessage").textContent =
            error.message;
    }
}


// 3. DISPLAY QUESTIONS

function renderQuestions() {
    const container = document.getElementById("questionsContainer");

    container.innerHTML = "";

    questions.forEach((question, index) => {
        const questionCard = document.createElement("div");
        questionCard.className = "quiz-question";

        const heading = document.createElement("h3");
        heading.textContent =
            (index + 1) + ". " + question.question;

        questionCard.appendChild(heading);

        const optionsContainer = document.createElement("div");
        optionsContainer.className = "quiz-options";

        question.options.forEach((option, optionIndex) => {
            const label = document.createElement("label");
            label.className = "quiz-option";

            const radio = document.createElement("input");

            radio.type = "radio";
            radio.name = "question-" + question.id;
            radio.value = optionIndex;

            radio.checked =
                selectedAnswers[question.id] === optionIndex;

            radio.disabled = quizSubmitted;

            radio.addEventListener("change", function() {
                selectedAnswers[question.id] = optionIndex;
                updateSubmitButton();
            });

            const optionText = document.createElement("span");
            optionText.textContent = option;

            label.appendChild(radio);
            label.appendChild(optionText);

            optionsContainer.appendChild(label);
        });

        questionCard.appendChild(optionsContainer);
        container.appendChild(questionCard);
    });

    document.getElementById("questionCount").textContent =
        questions.length + " questions";

    updateSubmitButton();
}


// 4. ENABLE SUBMIT ONLY WHEN ALL QUESTIONS ARE ANSWERED

function updateSubmitButton() {
    const allAnswered =
        questions.length > 0 &&
        questions.every(question =>
            selectedAnswers[question.id] !== undefined
        );

    document.getElementById("submitQuizButton").disabled =
        !allAnswered || quizSubmitted;
}


// 5. SUBMIT QUIZ

document.getElementById("submitQuizButton").addEventListener(
    "click",
    submitQuiz
);


async function submitQuiz() {
    if (quizSubmitted) {
        return;
    }

    const allAnswered = questions.every(question =>
        selectedAnswers[question.id] !== undefined
    );

    if (!allAnswered) {
        document.getElementById("quizMessage").textContent =
            "Please answer all questions first.";
        return;
    }

    try {
        document.getElementById("submitQuizButton").disabled = true;

        const result = await api.submitQuiz(
            quizLessonId,
            selectedAnswers
        );

        quizSubmitted = true;
        quizPassed = result.passed;

        showResults(result);

    } catch (error) {
        document.getElementById("quizMessage").textContent =
            "Unable to submit quiz: " + error.message;

        updateSubmitButton();
    }
}


// 6. DISPLAY RESULTS AND EXPLANATIONS

function showResults(result) {
    document.getElementById("quizContainer").style.display = "none";

    const resultsContainer =
        document.getElementById("resultsContainer");

    resultsContainer.style.display = "block";

    document.getElementById("scoreDisplay").textContent =
        result.score + " / " + result.total;

    document.getElementById("resultMessage").textContent =
        result.passed
            ? "Congratulations! You passed this quiz."
            : "You didn't reach the passing score. Review the explanations and try again.";

    const review = document.getElementById("answerReview");

    review.innerHTML = "";

    result.results.forEach((answer, index) => {

        // Find the original question using its ID
        const originalQuestion = questions.find(question =>
            String(question.id) === String(answer.question_id)
        );

        const card = document.createElement("div");
        card.className = "answer-review";

        const heading = document.createElement("h3");
        heading.textContent =
            (index + 1) + ". " +
            (originalQuestion
                ? originalQuestion.question
                : "Question " + answer.question_id);

        const selected = document.createElement("p");
        selected.textContent =
            "Your answer: " +
            (originalQuestion
                ? originalQuestion.options[answer.selected_option]
                : "Not available");

        const correct = document.createElement("p");
        correct.textContent =
            "Correct answer: " +
            (originalQuestion
                ? originalQuestion.options[answer.correct_option]
                : "Not available");

        const explanation = document.createElement("p");
        explanation.textContent =
            "Explanation: " + (answer.explanation || "No explanation available.");

        const status = document.createElement("p");
        status.textContent = answer.is_correct
            ? "Correct"
            : "Incorrect";

        status.className = answer.is_correct
            ? "success-message"
            : "error-message";

        card.appendChild(heading);
        card.appendChild(status);
        card.appendChild(selected);
        card.appendChild(correct);
        card.appendChild(explanation);

        review.appendChild(card);
    });

    document.getElementById("retryButton").style.display =
        result.passed ? "none" : "inline-block";

    // Show next lesson only if there is another lesson
    document.getElementById("nextModuleButton").style.display =
        result.passed && nextLesson
            ? "inline-block"
            : "none";
}


// 7. RETRY QUIZ

document.getElementById("retryButton").addEventListener(
    "click",
    function() {
        selectedAnswers = {};
        quizSubmitted = false;
        quizPassed = false;

        document.getElementById("resultsContainer").style.display = "none";
        document.getElementById("quizContainer").style.display = "block";

        document.getElementById("quizMessage").textContent = "";

        renderQuestions();
    }
);


// 8. GO TO NEXT LESSON

document.getElementById("nextModuleButton").addEventListener(
    "click",
    function() {
        if (nextLesson) {
            window.location.href =
                "lesson.html?id=" + nextLesson.id;
        }
    }
);


// 9. GO TO DASHBOARD

document.getElementById("dashboardButton").addEventListener(
    "click",
    function() {
        window.location.href = "dashboard.html";
    }
);
