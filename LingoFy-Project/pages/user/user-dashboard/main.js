document.addEventListener("DOMContentLoaded", () => {
  const quizList = document.getElementById("quizList");
  const quizSection = document.getElementById("quizSection");
  const emptySection = document.getElementById("emptySection");

  const tests = JSON.parse(localStorage.getItem("forms")) || [];

  // Reset visibility
  quizSection.classList.add("d-none");
  emptySection.classList.add("d-none");

  if (tests.length === 0) {
    emptySection.classList.remove("d-none");
    quizList.innerHTML = "";
  } else {
    quizSection.classList.remove("d-none");
    quizList.innerHTML = "";

    tests.forEach((test) => {
      const card = document.createElement("div");
      card.className = "col-md-4 mb-3";

      card.innerHTML = `
        <div class="card shadow-sm p-3 h-100">
          <h5>${test.formTitle}</h5>
          <p class="text-muted">${test.formDesc}</p>
          <p class="text-muted small">Questions: ${test.numberOfQuestions}</p>
          <p class="text-muted small">Created: ${
            test?.formDate ?? "Not Set"
          }</p>
          <button class="btn btn-primary w-100" onclick="startQuiz('${
            test.formId
          }')">Start</button>
        </div>
      `;

      quizList.appendChild(card);
    });
  }
});

// ===== Quiz Taker Main JS =====
const quizId = localStorage.getItem("currentQuiz");
const allForms = JSON.parse(localStorage.getItem("forms")) || [];
const quizData = allForms.find((f) => f.formId === quizId);
let currentIndex = 0;
let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];

// DOM elements
const questionText = document.getElementById("questionText");
const radioOptionsContainer = document.getElementById("radioOptionsContainer");
const selectContainer = document.getElementById("selectContainer");
const selectAnswer = document.getElementById("selectAnswer");
const questionNumberBadge = document.getElementById("questionNumber");
const requiredBadge = document.getElementById("requiredBadge");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

// Redirect if quiz not found
// if (!quizData) {
//   alert("No quiz found. Redirecting...");
//   window.location.href = "../dashboard/index.html";
// }

// ---------- Functions ----------
function loadQuestion() {
  const q = quizData.questions[currentIndex];

  // Question text
  questionText.textContent = q.questionTitle;

  // Badges
  questionNumberBadge.textContent = `Q${currentIndex + 1}`;
  requiredBadge.style.display = q.isRequired ? "inline-block" : "none";

  // Progress
  const currentQuestionEl = document.getElementById("currentQuestion");
  const totalQuestionsEl = document.getElementById("totalQuestions");
  const progressBar = document.getElementById("progressBar");
  const progressPercentEl = document.getElementById("progressPercent");

  currentQuestionEl.textContent = currentIndex + 1;
  totalQuestionsEl.textContent = quizData.questions.length;

  const percentComplete = Math.round(
    ((currentIndex + 1) / quizData.questions.length) * 100
  );
  progressBar.style.width = percentComplete + "%";
  progressPercentEl.textContent = percentComplete;

  // Clear previous options
  radioOptionsContainer.innerHTML = "";
  selectAnswer.innerHTML = '<option value="">Choose an option</option>';

  // Render options
  if (q.questionType === "multipleChoice") {
    radioOptionsContainer.classList.remove("d-none");
    selectContainer.classList.add("d-none");
    q.options.forEach((opt, i) => {
      radioOptionsContainer.innerHTML += `
                <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" name="radioAnswer" id="radio${i}" value="${
        opt.optionContent
      }" ${userAnswers[currentIndex] === opt.optionContent ? "checked" : ""}>
                    <label class="form-check-label" for="radio${i}">${
        opt.optionContent
      }</label>
                </div>
            `;
    });
  } else if (q.questionType === "select") {
    radioOptionsContainer.classList.add("d-none");
    selectContainer.classList.remove("d-none");
    q.options.forEach((opt) => {
      selectAnswer.innerHTML += `<option value="${opt.optionContent}" ${
        userAnswers[currentIndex] === opt.optionContent ? "selected" : ""
      }>${opt.optionContent}</option>`;
    });
  }

  // Navigation buttons
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === quizData.questions.length - 1;
  nextBtn.classList.toggle(
    "d-none",
    currentIndex === quizData.questions.length - 1
  );
  submitBtn.classList.toggle(
    "d-none",
    currentIndex !== quizData.questions.length - 1
  );
}

function saveAnswer() {
  const selectedRadio = document.querySelector(
    "input[name='radioAnswer']:checked"
  );
  const selectedSelect = selectAnswer.value;

  if (radioOptionsContainer.classList.contains("d-none")) {
    userAnswers[currentIndex] = selectedSelect || "";
  } else {
    userAnswers[currentIndex] = selectedRadio ? selectedRadio.value : "";
  }

  localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
}

function nextQuestion() {
  saveAnswer();
  if (currentIndex < quizData.questions.length - 1) {
    currentIndex++;
    loadQuestion();
  }
}

function previousQuestion() {
  saveAnswer();
  if (currentIndex > 0) {
    currentIndex--;
    loadQuestion();
  }
}

function submitTest() {
  saveAnswer();
  let correct = 0;
  quizData.questions.forEach((q, i) => {
    const correctAnswer = q.options.find((opt) => opt.isCorrect).optionContent;
    if (userAnswers[i] === correctAnswer) correct++;
  });
  localStorage.setItem(
    "lastScore",
    JSON.stringify({
      score: correct,
      total: quizData.questions.length,
    })
  );
  window.location.href = "/pages/user/score/";
}

// ---------- Initialize ----------
document.addEventListener("DOMContentLoaded", loadQuestion);
prevBtn.addEventListener("click", previousQuestion);
nextBtn.addEventListener("click", nextQuestion);
submitBtn.addEventListener("click", submitTest);
function startQuiz(id) {
  localStorage.setItem("userAnswers", JSON.stringify([]));
  localStorage.setItem("currentQuiz", id);
  window.location.href = "/pages/user/quiz-page/index.html";
}
