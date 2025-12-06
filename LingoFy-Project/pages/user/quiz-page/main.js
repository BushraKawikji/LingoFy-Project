// ===== Quiz Taker Main JS =====
const quizId = localStorage.getItem("currentQuiz");
const allForms = JSON.parse(localStorage.getItem("forms")) || [];
const quizData = allForms.find(f => f.formId === quizId);
let currentIndex = 0;
let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];

const questionText = document.getElementById("questionText");
const radioOptionsContainer = document.getElementById("radioOptionsContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

if (!quizData) {
    alert("No quiz found. Redirecting...");
    window.location.href = "../dashboard/index.html";
}

function loadQuestion() {
    const q = quizData.questions[currentIndex];
    questionText.textContent = q.questionTitle;

    radioOptionsContainer.innerHTML = "";
    if (q.questionType === "multipleChoice") {
        q.options.forEach((opt, i) => {
            radioOptionsContainer.innerHTML += `
        <div class="form-check mb-2">
          <input class="form-check-input" type="radio" name="radioAnswer" id="radio${i}" value="${opt.optionContent}" ${userAnswers[currentIndex] === opt.optionContent ? "checked" : ""}>
          <label class="form-check-label" for="radio${i}">${opt.optionContent}</label>
        </div>
      `;
        });
    }

    prevBtn.disabled = currentIndex === 0;
    nextBtn.classList.toggle("d-none", currentIndex === quizData.questions.length - 1);
    submitBtn.classList.toggle("d-none", currentIndex !== quizData.questions.length - 1);
}

function saveAnswer() {
    const selected = document.querySelector("input[name='radioAnswer']:checked");
    userAnswers[currentIndex] = selected ? selected.value : "";
    localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
}

function nextQuestion() { saveAnswer(); currentIndex++; loadQuestion(); }
function previousQuestion() { saveAnswer(); currentIndex--; loadQuestion(); }

function submitTest() {
    saveAnswer();
    let correct = 0;
    quizData.questions.forEach((q, i) => {
        const correctAnswer = q.options.find(opt => opt.isCorrect).optionContent;
        if (userAnswers[i] === correctAnswer) correct++;
    });
    localStorage.setItem("lastScore", JSON.stringify({ score: correct, total: quizData.questions.length }));
    window.location.href = "../score/index.html";
}

document.addEventListener("DOMContentLoaded", loadQuestion);
