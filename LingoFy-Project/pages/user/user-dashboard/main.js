// ===== Dashboard Main JS =====
document.addEventListener("DOMContentLoaded", () => {
  const quizList = document.getElementById("quizList");
  const quizSection = document.getElementById("quizSection");
  const emptySection = document.getElementById("emptySection");

  // Load tests from localStorage (same key as form creation)
  const tests = JSON.parse(localStorage.getItem("forms")) || [];

  if (tests.length === 0) {
    // Fixed: was = instead of ===
    // Show "No Tests Available"
    emptySection.style.display = "flex";
    quizSection.style.display = "none";
    quizList.innerHTML = ""; // Clear any leftover content
  } else {
    // Show test list
    quizSection.style.display = "block";
    emptySection.style.display = "none";

    // Clear previous content
    quizList.innerHTML = "";

    // Render test cards (using the correct property names from your form creation)
    tests.forEach((test) => {
      const card = document.createElement("div");
      card.className = "col-md-4 mb-3";
      card.innerHTML = `
                <div class="card shadow-sm p-3 h-100">
                    <h5>${test.formTitle}</h5>
                    <p class="text-muted">${test.formDesc}</p>
                    <p class="text-muted small">Questions: ${test.numberOfQuestions}</p>
                    <p class="text-muted small">Created: ${test.formDate}</p>
                    <button class="btn btn-primary w-100" onclick="startQuiz('${test.formId}')">Start</button>
                </div>
            `;
      quizList.appendChild(card);
    });
  }
});

// Function to start quiz
function startQuiz(id) {
  // Reset user answers
  localStorage.setItem("userAnswers", JSON.stringify([]));
  // Set current quiz
  localStorage.setItem("currentQuiz", id);
  // Redirect to quiz page
  window.location.href = "/LingoFy-Project/pages/user/quiz-page/index.html";
}
