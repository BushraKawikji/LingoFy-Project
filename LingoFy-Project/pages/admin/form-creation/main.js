// ===== Variables =====
let optionId = 0;
let isBoldActive = false;
let isItalicActive = false;
let isUnderlineActive = false;

let optionsCounter = 0;
let questionsCounter = 0;

let formStatus = true;
let forms = JSON.parse(localStorage.getItem("forms")) || [];
let formId = forms.length ? forms[forms.length - 1].formId : 0;

let questionsData = [];

// ===== Form Elements =====
const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");
const saveFormBtn = document.getElementById("saveFormBtn");

// ===== Question Elements =====
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

// ===== Editing State =====
let isEditing = false;
let editingFormId = null;

const editingForm = JSON.parse(localStorage.getItem("editingForm"));
if (editingForm) {
  isEditing = true;
  editingFormId = editingForm.formId;

  // Populate form fields with existing data
  formTitle.value = editingForm.formTitle;
  formDescription.value = editingForm.formDesc;

  // Change button style/text for editing mode
  saveFormBtn.textContent = "Update Form";
  saveFormBtn.classList.add("btn-warning");
  saveFormBtn.classList.remove("btn-primary");

  // Load questions from existing form
  questionsData = [...editingForm.questions];
  questionsCounter = questionsData.length;

  // Render questions
  renderQuestions();

  // Remove temporary editingForm from localStorage
  localStorage.removeItem("editingForm");
}

// ===== Save Form (Create / Update) =====
saveFormBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (isEditing) {
    updateExistingForm();
  } else {
    createNewForm();
  }
});

function createNewForm() {
  ++formId;

  if (!formTitle.value.trim()) {
    Swal.fire({
      text: "Please fill the form title.",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  if (questionsData.length === 0) {
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
    formStatus: true, // New forms are active by default
    numberOfQuestions: questionsData.length,
    questions: questionsData,
  };

  forms.push(formObj);
  window.localStorage.setItem("forms", JSON.stringify(forms));

  Swal.fire({
    text: "Form saved successfully!",
    confirmButtonColor: "#198754",
    icon: "success",
  }).then(() => {
    window.location.href = "../admin-dashboard/index.html";
  });
}

function updateExistingForm() {
  if (!formTitle.value.trim()) {
    Swal.fire({
      text: "Please fill the form title.",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  if (questionsData.length === 0) {
    Swal.fire({
      text: "Please add at least one question before saving the form.",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  // Preserve old status if found
  const existingForm = forms.find((f) => f.formId === editingFormId);

  const formObj = {
    formId: editingFormId,
    formDate: new Date().toLocaleDateString(), // Update date on edit
    formTitle: formTitle.value,
    formDesc: formDescription.value,
    formStatus: existingForm ? existingForm.formStatus : true,
    numberOfQuestions: questionsData.length,
    questions: questionsData,
  };

  const updatedForms = forms.map((form) =>
    form.formId === editingFormId ? formObj : form
  );

  window.localStorage.setItem("forms", JSON.stringify(updatedForms));

  Swal.fire({
    text: "Form updated successfully!",
    confirmButtonColor: "#198754",
    icon: "success",
  }).then(() => {
    window.location.href = "../admin-dashboard/index.html";
  });
}

// ===== Render Questions =====
function renderQuestions() {
  questionsList.innerHTML = "";

  if (questionsData.length === 0) {
    questionsList.innerHTML =
      '<p class="text-muted text-center py-4">No questions added yet</p>';
    questionsCounter = 0;
    return;
  }

  // Renumber questions sequentially
  questionsData.forEach((question, index) => {
    question.questionId = index + 1;
  });

  questionsCounter = questionsData.length;

  questionsData.forEach((question) => {
    const card = document.createElement("div");
    card.className = "card mb-3";
    card.setAttribute("data-id", question.questionId);

    // Apply formatting styles to the question text
    let formattedQuestionText = question.questionTitle;
    if (question.formatting) {
      const { bold, italic, underline } = question.formatting;

      if (bold)
        formattedQuestionText = `<strong>${formattedQuestionText}</strong>`;
      if (italic) formattedQuestionText = `<em>${formattedQuestionText}</em>`;
      if (underline) formattedQuestionText = `<u>${formattedQuestionText}</u>`;
    }

    const optionsCount = question.options ? question.options.length : 0;

    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="badge bg-primary">Q${question.questionId}</span>
          ${
            question.isRequired
              ? '<span class="badge bg-warning"><i class="bi bi-asterisk me-1"></i>Required</span>'
              : ""
          }
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-warning" onclick="editQuestion(${
              question.questionId
            })">
              <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="removeQuestion(${
              question.questionId
            })">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
        <p class="mb-2">${formattedQuestionText}</p>
        <small class="text-muted">
          Type: ${question.questionType} | Options: ${optionsCount}
        </small>
      </div>
    `;
    questionsList.appendChild(card);
  });
}

// ===== Edit Question =====
function editQuestion(questionId) {
  const questionToEdit = questionsData.find((q) => q.questionId === questionId);

  if (!questionToEdit) {
    Swal.fire({
      title: "Error!",
      text: "Question not found!",
      icon: "error",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  // Populate question form
  questionTitle.value = questionToEdit.questionTitle;

  // Apply formatting
  if (questionToEdit.formatting) {
    const { bold, italic, underline, fontFamily } = questionToEdit.formatting;

    isBoldActive = !!bold;
    isItalicActive = !!italic;
    isUnderlineActive = !!underline;

    questionTitle.style.fontWeight = bold ? "bold" : "normal";
    questionTitle.style.fontStyle = italic ? "italic" : "normal";
    questionTitle.style.textDecoration = underline ? "underline" : "none";

    if (fontFamily) {
      questionTitle.style.fontFamily = fontFamily;
      fontStyle.value =
        fontFamily === "Arial, Helvetica, sans-serif"
          ? "sans"
          : fontFamily === "Times New Roman, Georgia, serif"
          ? "serif"
          : "mono";
    }

    updateFormattingButtonStates();
  }

  questionType.value = questionToEdit.questionType;
  isRequired.checked = questionToEdit.isRequired;

  // Show appropriate options container
  if (questionToEdit.questionType === "radio") {
    radioOptions.classList.remove("d-none");
    checkboxOptions.classList.add("d-none");

    radioOptionsContainer.innerHTML = "";
    questionToEdit.options.forEach((option, index) => {
      const optionHTML = `
        <div class="option-item mb-2 d-flex align-items-center gap-2">
          <input type="text" class="form-control" placeholder="Option text" value="${
            option.optionContent
          }">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="correctOption" value="${index}" ${
        option.isCorrect ? "checked" : ""
      }>Correct
          </div>
          <button class="btn btn-sm btn-outline-danger" type="button" onclick="removeOption(this)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      radioOptionsContainer.insertAdjacentHTML("beforeend", optionHTML);
    });
  } else if (questionToEdit.questionType === "select") {
    checkboxOptions.classList.remove("d-none");
    radioOptions.classList.add("d-none");

    checkboxOptionsContainer.innerHTML = "";
    questionToEdit.options.forEach((option, index) => {
      const optionHTML = `
        <div class="option-item mb-2 d-flex align-items-center gap-2">
          <input type="text" class="form-control" placeholder="Option text" value="${
            option.optionContent
          }">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" name="correctOption" value="${index}" ${
        option.isCorrect ? "checked" : ""
      }>Correct
          </div>
          <button class="btn btn-sm btn-outline-danger" type="button" onclick="removeOption(this)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      checkboxOptionsContainer.insertAdjacentHTML("beforeend", optionHTML);
    });
  }

  // Store current editing question ID
  window.currentlyEditingQuestionId = questionId;

  // Change button to "Update Question"
  const addQuestionBtn = document.querySelector(
    'button[onclick="addQuestion(event)"]'
  );
  if (addQuestionBtn) {
    addQuestionBtn.textContent = "Update Question";
    addQuestionBtn.classList.remove("btn-primary");
    addQuestionBtn.classList.add("btn-success");
    addQuestionBtn.setAttribute("onclick", "updateExistingQuestion()");
  }
}

// ===== Update Existing Question =====
function updateExistingQuestion() {
  const questionId = window.currentlyEditingQuestionId;

  if (!questionId) {
    Swal.fire({
      text: "No question is currently being edited!",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

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
    const container =
      questionType.value === "radio"
        ? radioOptionsContainer
        : checkboxOptionsContainer;
    const optionItems = container.querySelectorAll(".option-item");

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
        optionId: Date.now() + Math.floor(Math.random() * 1000),
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

  const questionIndex = questionsData.findIndex(
    (q) => q.questionId === questionId
  );
  if (questionIndex !== -1) {
    questionsData[questionIndex] = {
      questionId: questionId,
      questionTitle: questionTitle.value,
      questionType: questionType.value,
      isRequired: isRequired.checked,
      options: options,
      formatting: {
        bold: isBoldActive,
        italic: isItalicActive,
        underline: isUnderlineActive,
        fontFamily: questionTitle.style.fontFamily,
      },
    };
  }

  // Reset fields
  questionTitle.value = "";
  questionType.value = "text";
  isRequired.checked = true;
  resetFormatting();

  // Reset default options in containers
  radioOptionsContainer.innerHTML = `
    <div class="option-item mb-2 d-flex align-items-center gap-2">
      <input type="text" class="form-control" placeholder="Option text" />
      <div class="form-check">
        <input class="form-check-input" type="radio" name="correctOption" value="0" />
        <label class="form-check-label small">Correct</label>
      </div>
      <button class="btn btn-sm btn-outline-danger" type="button"
        onclick="removeOption(this)">
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <div class="option-item mb-2 d-flex align-items-center gap-2">
      <input type="text" class="form-control" placeholder="Option text" />
      <div class="form-check">
        <input class="form-check-input" type="radio" name="correctOption" value="1" />
        <label class="form-check-label small">Correct</label>
      </div>
      <button class="btn btn-sm btn-outline-danger" type="button"
        onclick="removeOption(this)">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;

  checkboxOptionsContainer.innerHTML = `
    <div class="option-item mb-2 d-flex align-items-center gap-2">
      <input type="text" class="form-control" placeholder="Option text" />
      <div class="form-check">
        <input class="form-check-input" type="checkbox" name="correctOption"
          value="0" />
        <label class="form-check-label small">Correct</label>
      </div>
      <button class="btn btn-sm btn-outline-danger" type="button"
        onclick="removeOption(this)">
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <div class="option-item mb-2 d-flex align-items-center gap-2">
      <input type="text" class="form-control" placeholder="Option text" />
      <div class="form-check">
        <input class="form-check-input" type="checkbox" name="correctOption"
          value="1" />
        <label class="form-check-label small">Correct</label>
      </div>
      <button class="btn btn-sm btn-outline-danger" type="button"
        onclick="removeOption(this)">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;

  radioOptions.classList.add("d-none");
  checkboxOptions.classList.add("d-none");

  // Reset button to "Add Question"
  const addQuestionBtn = document.querySelector(
    'button[onclick="updateExistingQuestion()"]'
  );
  if (addQuestionBtn) {
    addQuestionBtn.textContent = "Add Question";
    addQuestionBtn.classList.remove("btn-success");
    addQuestionBtn.classList.add("btn-primary");
    addQuestionBtn.setAttribute("onclick", "addQuestion(event)");
  }

  delete window.currentlyEditingQuestionId;

  renderQuestions();

  Swal.fire({
    text: "Question updated successfully!",
    confirmButtonColor: "#198754",
    icon: "success",
  });
}

// ===== Formatting Button States =====
function updateFormattingButtonStates() {
  if (isBoldActive) {
    boldBtn.classList.add("btn-primary");
    boldBtn.classList.remove("btn-outline-secondary");
  } else {
    boldBtn.classList.add("btn-outline-secondary");
    boldBtn.classList.remove("btn-primary");
  }

  if (isItalicActive) {
    italicBtn.classList.add("btn-primary");
    italicBtn.classList.remove("btn-outline-secondary");
  } else {
    italicBtn.classList.add("btn-outline-secondary");
    italicBtn.classList.remove("btn-primary");
  }

  if (isUnderlineActive) {
    underlineBtn.classList.add("btn-primary");
    underlineBtn.classList.remove("btn-outline-secondary");
  } else {
    underlineBtn.classList.add("btn-outline-secondary");
    underlineBtn.classList.remove("btn-primary");
  }
}

// ===== Reset Formatting =====
function resetFormatting() {
  isBoldActive = false;
  isItalicActive = false;
  isUnderlineActive = false;

  questionTitle.style.fontWeight = "normal";
  questionTitle.style.fontStyle = "normal";
  questionTitle.style.textDecoration = "none";
  questionTitle.style.fontFamily = "Arial, Helvetica, sans-serif";

  fontStyle.value = "sans";

  updateFormattingButtonStates();
}

// ===== Formatting Events =====
boldBtn.addEventListener("click", () => {
  isBoldActive = !isBoldActive;
  questionTitle.style.fontWeight = isBoldActive ? "bold" : "normal";
  updateFormattingButtonStates();
});

italicBtn.addEventListener("click", () => {
  isItalicActive = !isItalicActive;
  questionTitle.style.fontStyle = isItalicActive ? "italic" : "normal";
  updateFormattingButtonStates();
});

underlineBtn.addEventListener("click", () => {
  isUnderlineActive = !isUnderlineActive;
  questionTitle.style.textDecoration = isUnderlineActive ? "underline" : "none";
  updateFormattingButtonStates();
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

// ===== Question Type (show/hide options) =====
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

// ===== Add Question =====
function addQuestion(e) {
  e.preventDefault();

  if (window.currentlyEditingQuestionId) {
    return; // Don't add while in editing mode
  }

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
    const container =
      questionType.value === "radio"
        ? radioOptionsContainer
        : checkboxOptionsContainer;
    const optionItems = container.querySelectorAll(".option-item");

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

  const newQuestionId = questionsData.length + 1;
  ++questionsCounter;

  const questionObj = {
    questionId: newQuestionId,
    questionTitle: questionTitle.value,
    questionType: questionType.value,
    isRequired: isRequired.checked,
    options: options,
    formatting: {
      bold: isBoldActive,
      italic: isItalicActive,
      underline: isUnderlineActive,
      fontFamily: questionTitle.style.fontFamily,
    },
  };

  questionsData.push(questionObj);

  if (questionsCounter === 1 && questionsList.firstElementChild) {
    if (questionsList.firstElementChild.tagName.toLowerCase() === "p") {
      questionsList.removeChild(questionsList.firstElementChild);
    }
  }

  // Format question text
  let formattedQuestionText = questionObj.questionTitle;
  const { bold, italic, underline } = questionObj.formatting;

  if (bold) formattedQuestionText = `<strong>${formattedQuestionText}</strong>`;
  if (italic) formattedQuestionText = `<em>${formattedQuestionText}</em>`;
  if (underline) formattedQuestionText = `<u>${formattedQuestionText}</u>`;

  const card = document.createElement("div");
  card.className = "card mb-3";
  card.setAttribute("data-id", newQuestionId);

  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span class="badge bg-primary">Q${newQuestionId}</span>
        ${
          questionObj.isRequired
            ? '<span class="badge bg-warning"><i class="bi bi-asterisk me-1"></i>Required</span>'
            : ""
        }
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-warning" onclick="editQuestion(${newQuestionId})">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="removeQuestion(${newQuestionId})">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
      <p class="mb-2">${formattedQuestionText}</p>
      <small class="text-muted">
        Type: ${questionObj.questionType} | Options: ${
    questionObj.options.length
  }
      </small>
    </div>
  `;
  questionsList.appendChild(card);

  // Store current type before resetting
  const currentType = questionType.value;

  // Reset form
  questionTitle.value = "";
  questionType.value = "text";
  isRequired.checked = true;
  resetFormatting();

  // Clear options inputs for the type that was just added
  if (currentType === "radio" || currentType === "select") {
    const container =
      currentType === "radio"
        ? radioOptionsContainer
        : checkboxOptionsContainer;
    const optionItems = container.querySelectorAll(".option-item");

    optionItems.forEach((item) => {
      const textInput = item.querySelector('input[type="text"]');
      const correctInput = item.querySelector(".form-check-input");

      if (textInput) textInput.value = "";
      if (correctInput) correctInput.checked = false;
    });
  }
}

// ===== Remove Question =====
function removeQuestion(id) {
  questionsData = questionsData.filter((q) => q.questionId !== id);
  renderQuestions();
}

// ===== Add Option =====
function addOption() {
  ++optionsCounter;
  ++optionId;

  let optionHTML = "";

  if (questionType.value === "radio") {
    optionHTML = `
      <div class="option-item mb-2 d-flex align-items-center gap-2">
        <input type="text" class="form-control" placeholder="Option text">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="correctOption" value="${optionsCounter}">Correct
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
          <input class="form-check-input" type="checkbox" name="correctOption" value="${optionsCounter}">Correct
        </div>
        <button class="btn btn-sm btn-outline-danger" type="button" onclick="removeOption(this)">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
    checkboxOptionsContainer.insertAdjacentHTML("beforeend", optionHTML);
  }
}

// ===== Remove Option =====
function removeOption(element) {
  const container = element.closest(".optionsContainer");
  const optionItems = container.querySelectorAll(".option-item");

  if (optionItems.length <= 2) {
    Swal.fire({
      text: "At least two options are required",
      confirmButtonColor: "#ffc107",
      icon: "warning",
    });
    return;
  }

  element.closest(".option-item").remove();
  optionsCounter--;
}
