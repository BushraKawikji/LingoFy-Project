// Variables
let questionId = 0;
let optionId = 0;

let optionsCounter = 0;
let questionsCounter = 0;

let formStatus = true;
let forms = JSON.parse(localStorage.getItem("forms")) || [];
let formId = forms.length ? forms[forms.length - 1].formId : 0;

let questionsData = [];

// Form
const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");
const saveFormBtn = document.getElementById("saveFormBtn");

// Question
const questionTitle = document.getElementById("questionText");
const questionType = document.getElementById("questionType");
const isRequired = document.getElementById("requiredToggle");
const questionsList = document.getElementById("questionsList");

// Options blocks
const radioOptions = document.getElementById("radioOptions");
const checkboxOptions = document.getElementById("checkboxOptions");

// Options containers
const radioOptionsContainer = document.getElementById("radioOptionsContainer");
const checkboxOptionsContainer = document.getElementById(
  "checkboxOptionsContainer"
);

// Formatting buttons
const boldBtn = document.getElementById("bold");
const italicBtn = document.getElementById("italic");
const underlineBtn = document.getElementById("underline");
const fontStyle = document.getElementById("fontStyle");

// ------------------- Save Form ----------------
saveFormBtn.addEventListener("click", (e) => {
  e.preventDefault();
  ++formId;

  if (!formTitle.value.trim()) {
    Swal.fire({
      text: "Please fill the form title.",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  if (questionsCounter === 0) {
    Swal.fire({
      text: "Please add at least one question before saving the form.",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  const formObj = {
    formId: formId,
    formDate: new Date().toLocaleDateString(),
    formTitle: formTitle.value,
    formDesc: formDescription.value,
    formStatus: formStatus,
    numberOfQuestions: questionsData.length,
    questions: questionsData,
  };

  forms.push(formObj);
  window.localStorage.setItem("forms", JSON.stringify(forms));

  Swal.fire({
    text: "Form saved successfully!",
    confirmButtonColor: "#198754",
    icon: "success",
  });
});

// ----------- Question Formatting -------------
let boldFlag = false;
boldBtn.addEventListener("click", () => {
  boldFlag = !boldFlag;
  questionTitle.style.fontWeight = boldFlag ? "bold" : "normal";
});

let italicFlag = false;
italicBtn.addEventListener("click", () => {
  italicFlag = !italicFlag;
  questionTitle.style.fontStyle = italicFlag ? "italic" : "normal";
});

let underlineFlag = false;
underlineBtn.addEventListener("click", () => {
  underlineFlag = !underlineFlag;
  questionTitle.style.textDecoration = underlineFlag ? "underline" : "none";
});

fontStyle.addEventListener("change", () => {
  if (fontStyle.value === "sans") {
    questionTitle.style.fontFamily = "Arial, Helvetica, sans-serif";
  } else if (fontStyle.value === "serif") {
    questionTitle.style.fontFamily = "Times New Roman, Georgia, serif";
  } else if (fontStyle.value === "mono") {
    questionTitle.style.fontFamily = "Courier New, Lucida Console, monospace";
  }
});

// ----------- Question Type (show/hide options) -------------
if (questionType) {
  questionType.addEventListener("change", function () {
    optionsCounter = 2;

    if (this.value === "radio") {
      radioOptions.classList.remove("d-none");
    } else {
      radioOptions.classList.add("d-none");
    }

    if (this.value === "select") {
      checkboxOptions.classList.remove("d-none");
    } else {
      checkboxOptions.classList.add("d-none");
    }
  });
}

// ----------- Add Question -------------
function addQuestion(e) {
  e.preventDefault();

  if (!questionTitle.value.trim()) {
    Swal.fire({
      text: "Please enter a question text",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  let options = [];

  if (questionType.value === "radio" || questionType.value === "select") {
    let container =
      questionType.value === "radio"
        ? radioOptionsContainer
        : checkboxOptionsContainer;
    let optionItems = container.querySelectorAll(".option-item");

    if (optionItems.length < 2) {
      Swal.fire({
        text: "At least two options are required",
        confirmButtonColor: "#ffc107",
        icon: "warning",
      });
      return;
    }

    let hasEmpty = false;
    let hasCorrect = false;

    optionItems.forEach((item) => {
      const textInput = item.querySelector('input[type="text"]');
      const correctInput = item.querySelector(".form-check-input");

      const value = textInput.value.trim();
      if (!value) {
        hasEmpty = true;
      }

      const isCorrect = correctInput.checked;
      if (isCorrect) {
        hasCorrect = true;
      }

      options.push({
        optionId: ++optionId,
        optionContent: value,
        isCorrect: isCorrect,
      });
    });

    if (hasEmpty) {
      Swal.fire({
        text: "Please fill all options",
        confirmButtonColor: "#ffc107",
        icon: "warning",
      });
      return;
    }

    if (!hasCorrect) {
      Swal.fire({
        text: "Please choose the correct answer",
        confirmButtonColor: "#ffc107",
        icon: "warning",
      });
      return;
    }
  }

  ++questionId;
  ++questionsCounter;

  const questionObj = {
    questionId: questionId,
    questionTitle: questionTitle.value,
    questionType: questionType.value,
    isRequired: isRequired.checked,
    options: options,
  };

  questionsData.push(questionObj);

  if (questionsCounter === 1 && questionsList.firstElementChild) {
    if (questionsList.firstElementChild.tagName.toLowerCase() === "p") {
      questionsList.removeChild(questionsList.firstElementChild);
    }
  }

  questionsList.innerHTML += `
    <div class="card mb-3" data-id="${questionId}">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="badge bg-primary">Q${questionId}</span>
          ${
            questionObj.isRequired
              ? '<span class="badge bg-warning"><i class="bi bi-asterisk me-1"></i>Required</span>'
              : ""
          }
          <button class="btn btn-sm btn-outline-danger" onclick="removeQuestion(${questionId})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <p class="mb-2">${questionObj.questionTitle}</p>
        <small class="text-muted">
          Type: ${questionObj.questionType} | Options: ${
    questionObj.options.length
  }
        </small>
      </div>
    </div>
  `;

  questionTitle.value = "";

  if (questionType.value === "radio" || questionType.value === "select") {
    let container =
      questionType.value === "radio"
        ? radioOptionsContainer
        : checkboxOptionsContainer;

    let optionItems = container.querySelectorAll(".option-item");

    optionItems.forEach((item) => {
      const textInput = item.querySelector('input[type="text"]');
      const correctInput = item.querySelector(".form-check-input");

      if (textInput) textInput.value = "";
      if (correctInput) correctInput.checked = false;
    });
  }
}

// ------------ Remove Question ------------
function removeQuestion(id) {
  --questionsCounter;

  const card = questionsList.querySelector(`[data-id="${id}"]`);
  if (card) {
    card.remove();
  }
  questionsData = questionsData.filter((q) => q.questionId !== id);

  if (questionsCounter === 0) {
    questionsList.innerHTML =
      '<p class="text-muted text-center py-4">No questions added yet</p>';
  }
}

// ----------- Add Option -------------
function addOption() {
  ++optionsCounter;
  ++optionId;

  let optionHTML = "";

  if (questionType.value === "radio") {
    optionHTML = `
      <div class="option-item mb-2 d-flex align-items-center gap-2">
        <input type="text" class="form-control" placeholder="Option text">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="correctOptionRadio">Correct
        </div>
        <button class="btn btn-sm btn-outline-danger" type="button" onclick="removeOption(this)">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;

    radioOptionsContainer.insertAdjacentHTML("beforeend", optionHTML);
  } else if (questionType.value === "select") {
    optionHTML = `
      <div class="option-item mb-2 d-flex align-items-center gap-2">
        <input type="text" class="form-control" placeholder="Option text">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" name="correctOptionCheckbox">Correct
        </div>
        <button class="btn btn-sm btn-outline-danger" type="button" onclick="removeOption(this)">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;

    checkboxOptionsContainer.insertAdjacentHTML("beforeend", optionHTML);
  }
}

// ----------- Remove Option -------------
function removeOption(element) {
  if (optionsCounter <= 2) {
    Swal.fire({
      text: "At least two options are required",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  element.parentElement.remove();
  optionsCounter--;
}
