// ===== Score Main JS =====
const scoreData = JSON.parse(localStorage.getItem("lastScore"));
const quizId = localStorage.getItem("currentQuiz");
const allForms = JSON.parse(localStorage.getItem("forms")) || [];
const quiz = allForms.find(f => f.formId === quizId);
const userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];

if (scoreData && quiz) {
    document.getElementById("scoreDisplay").textContent = `${scoreData.score}/${scoreData.total}`;
    const tbody = document.getElementById("resultsTableBody");
    tbody.innerHTML = "";
    quiz.questions.forEach((q, i) => {
        const correctAnswer = q.options.find(opt => opt.isCorrect).optionContent;
        const status = userAnswers[i] === correctAnswer ? "Correct" : "Incorrect";
        tbody.innerHTML += `<tr>
      <td>${q.questionTitle}</td>
      <td>${userAnswers[i] || ""}</td>
      <td>${correctAnswer}</td>
      <td>${status}</td>
    </tr>`;
    });
}
