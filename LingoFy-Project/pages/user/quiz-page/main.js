// ===================== Quiz Taker Main JS =====================

// Get current quiz
const quizId = localStorage.getItem("currentQuiz");
const allForms = JSON.parse(localStorage.getItem("forms")) || [];
const quizData = allForms.find((f) => f.formId == quizId);

// Index & answers
let currentIndex = 0;
let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];

// ===================== DOM Elements =====================
const questionText = document.getElementById("questionText");
const radioOptionsContainer = document.getElementById("radioOptionsContainer");
const selectContainer = document.getElementById("selectContainer");
const selectAnswer = document.getElementById("selectAnswer");
const shortAnswerContainer = document.getElementById("shortAnswerContainer");
const shortAnswerInput = document.getElementById("shortAnswerInput");

const questionNumberBadge = document.getElementById("questionNumber");
const requiredBadge = document.getElementById("requiredBadge");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

const currentQuestionSpan = document.getElementById("currentQuestion");
const totalQuestionsSpan = document.getElementById("totalQuestions");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

// ===================== Guard if no quiz data =====================
if (!quizData || !quizData.questions || quizData.questions.length === 0) {
  console.error(
    "No quiz data found. Check currentQuiz and forms in localStorage."
  );
}

// ===================== Functions =====================

function loadQuestion() {
  if (!quizData || !quizData.questions || quizData.questions.length === 0)
    return;

  const q = quizData.questions[currentIndex];

  // Question text & labels
  questionText.textContent = q.questionTitle || "";
  questionNumberBadge.textContent = `Q${currentIndex + 1}`;
  requiredBadge.classList.toggle("d-none", !q.isRequired);

  const total = quizData.questions.length;
  currentQuestionSpan.textContent = currentIndex + 1;
  totalQuestionsSpan.textContent = total;

  const percent = Math.round(((currentIndex + 1) / total) * 100);
  progressBar.style.width = percent + "%";
  progressPercent.textContent = percent;

  // Reset UI
  radioOptionsContainer.innerHTML = "";
  selectAnswer.innerHTML = '<option value="">Choose an option</option>';
  shortAnswerInput.value = "";

  radioOptionsContainer.classList.add("d-none");
  selectContainer.classList.add("d-none");
  shortAnswerContainer.classList.add("d-none");

  // Normalize type
  const type = (q.questionType || "").toLowerCase();

  // ===== Multiple Choice (radio) =====
  if (type === "multiplechoice" || type === "radio") {
    radioOptionsContainer.classList.remove("d-none");

    (q.options || []).forEach((opt, i) => {
      const value = opt.optionContent ?? "";
      const isChecked = userAnswers[currentIndex] === value ? "checked" : "";

      radioOptionsContainer.innerHTML += `
        <div class="form-check mb-2">
          <input
            class="form-check-input"
            type="radio"
            name="radioAnswer"
            id="radio${i}"
            value="${value.replace(/"/g, "&quot;")}"
            ${isChecked}
          >
          <label class="form-check-label" for="radio${i}">
            ${value}
          </label>
        </div>
      `;
    });

    // ===== Select (dropdown) =====
  } else if (type === "select") {
    selectContainer.classList.remove("d-none");

    (q.options || []).forEach((opt) => {
      const value = opt.optionContent ?? "";
      const isSelected = userAnswers[currentIndex] === value ? "selected" : "";

      selectAnswer.innerHTML += `
        <option value="${value.replace(/"/g, "&quot;")}" ${isSelected}>
          ${value}
        </option>
      `;
    });

    // ===== Short Answer =====
  } else if (
    type === "shortanswer" ||
    type === "short" ||
    type === "short_answer" ||
    type === "text"
  ) {
    shortAnswerContainer.classList.remove("d-none");
    shortAnswerInput.value = userAnswers[currentIndex] || "";
  }

  // Button States
  prevBtn.disabled = currentIndex === 0;
  nextBtn.classList.toggle("d-none", currentIndex === total - 1);
  submitBtn.classList.toggle("d-none", currentIndex !== total - 1);
}

// Save current answer depending on question type
function saveAnswer() {
  if (!quizData || !quizData.questions || quizData.questions.length === 0)
    return;

  const q = quizData.questions[currentIndex];
  const type = (q.questionType || "").toLowerCase();

  let answer = "";

  if (type === "multiplechoice" || type === "radio") {
    const selectedRadio = document.querySelector(
      "input[name='radioAnswer']:checked"
    );
    answer = selectedRadio ? selectedRadio.value : "";
  } else if (type === "select") {
    answer = selectAnswer.value || "";
  } else if (
    type === "shortanswer" ||
    type === "short" ||
    type === "short_answer" ||
    type === "text"
  ) {
    answer = shortAnswerInput.value.trim();
  }

  userAnswers[currentIndex] = answer;
  localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
}

function nextQuestion() {
  if (!quizData || !quizData.questions) return;
  saveAnswer();
  if (currentIndex < quizData.questions.length - 1) {
    currentIndex++;
    loadQuestion();
  }
}

function previousQuestion() {
  if (!quizData || !quizData.questions) return;
  saveAnswer();
  if (currentIndex > 0) {
    currentIndex--;
    loadQuestion();
  }
}

function submitTest() {
  if (!quizData || !quizData.questions) return;

  saveAnswer();
  let score = 0;
  let totalGradable = 0; // عدد الأسئلة اللي فعلاً نقدر نصححها

  quizData.questions.forEach((q, i) => {
    const type = (q.questionType || "").toLowerCase();
    const userAnswer = (userAnswers[i] || "").trim().toLowerCase();

    // ===== Short Answer =====
    if (
      type === "shortanswer" ||
      type === "short" ||
      type === "short_answer" ||
      type === "text"
    ) {
      if (q.correctAnswer && q.correctAnswer.trim() !== "") {
        totalGradable++;
        const correct = q.correctAnswer.trim().toLowerCase();
        if (userAnswer === correct) {
          score++;
        }
      }
      return;
    }

    // ===== Multiple Choice / Select =====
    const correctOpt = q.options?.find((opt) => opt.isCorrect);
    if (!correctOpt) return;

    totalGradable++;

    const correctAnswer = (correctOpt.optionContent || "").trim();
    if (userAnswers[i] === correctAnswer) {
      score++;
    }
  });

  localStorage.setItem(
    "lastScore",
    JSON.stringify({
      score,
      total: totalGradable,
      allQuestions: quizData.questions.length,
    })
  );

  window.location.href = "/pages/user/score/index.html";
}

// ===================== Events =====================
document.addEventListener("DOMContentLoaded", () => {
  loadQuestion();
});

prevBtn.addEventListener("click", previousQuestion);
nextBtn.addEventListener("click", nextQuestion);
submitBtn.addEventListener("click", submitTest);
