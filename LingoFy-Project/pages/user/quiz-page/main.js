// ===================== Quiz Taker Main JS =====================

document.addEventListener("DOMContentLoaded", () => {
  // -------- 1) جلب الكويز من localStorage --------
  const quizIdRaw = localStorage.getItem("currentQuiz"); // مخزَّن كـ string
  const quizId = Number(quizIdRaw); // نحوله رقم عشان يطابق formId
  const allForms = JSON.parse(localStorage.getItem("forms")) || [];
  const quizData = allForms.find((f) => f.formId === quizId);

  console.log("currentQuiz:", quizIdRaw, "→ as number:", quizId);
  console.log("quizData:", quizData);

  if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
    alert("No quiz data found. Please start the quiz from the dashboard.");
    console.error("No quizData or no questions.");
    return;
  }

  let currentIndex = 0;
  let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];

  // -------- 2) عناصر الـ DOM --------
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

  // -------- 3) تحميل السؤال --------
  function loadQuestion() {
    const q = quizData.questions[currentIndex];
    console.log("Loading question:", currentIndex, q);

    // العنوان + البادجات
    if (questionText) questionText.textContent = q.questionTitle || "";
    if (questionNumberBadge) questionNumberBadge.textContent = `Q${currentIndex + 1}`;
    if (requiredBadge) requiredBadge.classList.toggle("d-none", !q.isRequired);

    const total = quizData.questions.length;
    if (currentQuestionSpan) currentQuestionSpan.textContent = currentIndex + 1;
    if (totalQuestionsSpan) totalQuestionsSpan.textContent = total;

    const percent = Math.round(((currentIndex + 1) / total) * 100);
    if (progressBar) progressBar.style.width = percent + "%";
    if (progressPercent) progressPercent.textContent = percent;

    // Reset UI
    if (radioOptionsContainer) {
      radioOptionsContainer.innerHTML = "";
      radioOptionsContainer.classList.add("d-none");
    }
    if (selectAnswer) {
      selectAnswer.innerHTML = '<option value="">Choose an option</option>';
    }
    if (selectContainer) selectContainer.classList.add("d-none");
    if (shortAnswerInput) shortAnswerInput.value = "";
    if (shortAnswerContainer) shortAnswerContainer.classList.add("d-none");

    // نوع السؤال
    const type = (q.questionType || "").toLowerCase();

    // ===== Multiple Choice / Radio =====
    if ((type === "multiplechoice" || type === "radio") && radioOptionsContainer) {
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

      // ===== Select (Dropdown) =====
    } else if (type === "select" && selectContainer && selectAnswer) {
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

      // ===== Short Answer / Text =====
    } else if (
      type === "shortanswer" ||
      type === "short" ||
      type === "short_answer" ||
      type === "text"
    ) {
      if (shortAnswerContainer && shortAnswerInput) {
        shortAnswerContainer.classList.remove("d-none");
        shortAnswerInput.value = userAnswers[currentIndex] || "";
      }
    }

    // أزرار التنقّل
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn && submitBtn) {
      const isLast = currentIndex === total - 1;
      nextBtn.classList.toggle("d-none", isLast);
      submitBtn.classList.toggle("d-none", !isLast);
    }
  }

  // -------- 4) حفظ الإجابة --------
  function saveAnswer() {
    const q = quizData.questions[currentIndex];
    const type = (q.questionType || "").toLowerCase();
    let answer = "";

    if (type === "multiplechoice" || type === "radio") {
      const selectedRadio = document.querySelector(
        "input[name='radioAnswer']:checked"
      );
      answer = selectedRadio ? selectedRadio.value : "";
    } else if (type === "select" && selectAnswer) {
      answer = selectAnswer.value || "";
    } else if (
      (type === "shortanswer" ||
        type === "short" ||
        type === "short_answer" ||
        type === "text") &&
      shortAnswerInput
    ) {
      answer = shortAnswerInput.value.trim();
    }

    userAnswers[currentIndex] = answer;
    localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    console.log("Saved answer", currentIndex, "→", answer);
  }

  // -------- 5) التنقّل بين الأسئلة --------
  function goNext() {
    saveAnswer();
    if (currentIndex < quizData.questions.length - 1) {
      currentIndex++;
      loadQuestion();
    }
  }

  function goPrev() {
    saveAnswer();
    if (currentIndex > 0) {
      currentIndex--;
      loadQuestion();
    }
  }

  // -------- 6) تسليم الكويز واحتساب العلامة --------
  function submitTest() {
    console.log("submitTest CALLED");
    saveAnswer();

    let score = 0;
    let totalGradable = 0;

    quizData.questions.forEach((q, i) => {
      const type = (q.questionType || "").toLowerCase();
      const raw = userAnswers[i] || "";
      const userAns = raw.trim().toLowerCase();

      // ---- Text / Short Answer ----
      if (
        type === "shortanswer" ||
        type === "short" ||
        type === "short_answer" ||
        type === "text"
      ) {
        // ما نحسبه إلا لو عنده correctAnswer
        if (q.correctAnswer && q.correctAnswer.trim() !== "") {
          totalGradable++;
          const correct = q.correctAnswer.trim().toLowerCase();
          if (userAns === correct) score++;
        }
        return;
      }

      // ---- MCQ / Select ----
      const correctOpt = q.options?.find((opt) => opt.isCorrect);
      if (!correctOpt) return;

      totalGradable++;

      const correctValue = (correctOpt.optionContent || "")
        .trim()
        .toLowerCase();

      if (userAns === correctValue) {
        score++;
      }
    });

    // لو ما في ولا سؤال قابل للتصحيح (مثلاً بس نص بدون correctAnswer)
    if (totalGradable === 0) {
      totalGradable = quizData.questions.length;
    }

    const resultObj = {
      score,
      total: totalGradable,
      allQuestions: quizData.questions.length,
    };

    console.log("Saving lastScore:", resultObj);
    localStorage.setItem("lastScore", JSON.stringify(resultObj));

    // روحي لصفحة النتيجة
    window.location.href = "/pages/user/score/index.html";
  }

  // -------- 7) تشغيل أول سؤال وربط الأحداث --------
  loadQuestion();

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      goPrev();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      goNext();
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      submitTest();
    });
  }
});
