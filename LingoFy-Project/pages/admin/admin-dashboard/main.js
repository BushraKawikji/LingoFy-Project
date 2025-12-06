let formObj = JSON.parse(localStorage.getItem("forms")) || [];

const activeTestsCard = this.document.getElementById("activeTestsCard");
const totalQuestionsCard = this.document.getElementById("totalQuestionsCard");
const studentsCard = this.document.getElementById("studentsCard");

const users = JSON.parse(this.localStorage.getItem("users"));

let activeTestsCounter = 0;
let numOfStudentsCounter = 0;
let totalQuestionsCounter = "undefined" ? 0 : totalQuestionsCounter;
formObj.forEach((form) => {
  if (form.formStatus) {
    activeTestsCounter++;
    totalQuestionsCounter += form.numberOfQuestions;
  }
});
users.forEach((user) => {
  if (user.role === "student") {
    numOfStudentsCounter++;
  }
});
activeTestsCard.innerHTML = activeTestsCounter;
totalQuestionsCard.innerHTML = totalQuestionsCounter;
studentsCard.innerHTML = numOfStudentsCounter;

// Function to get current user from localStorage
function getCurrentUser() {
  const currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    return JSON.parse(currentUser);
  }
  return null;
}

// Function to display user name in navbar
function displayUserName() {
  // Wait for DOM to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", displayUserName);
    return;
  }

  const userNameDisplay = document.getElementById("userNameDisplay");
  if (!userNameDisplay) {
    // If element doesn't exist yet, wait a bit and try again
    setTimeout(displayUserName, 100);
    return;
  }

  const currentUser = getCurrentUser();

  if (currentUser) {
    // Display user's full name or email if full name is not available
    const displayName =
      currentUser.fullName ||
      currentUser.email ||
      currentUser.username ||
      "User";
    userNameDisplay.textContent = displayName;

    // Also update the dropdown menu title
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    if (dropdownToggle) {
      // Remove any existing text and add the new name
      dropdownToggle.innerHTML = `<i class="bi bi-person-circle me-2"></i>${displayName}`;
    }
  } else {
    // If no user is logged in, redirect to login
    window.location.href =
      "/lllingofy/LingoFy-Project/pages/shared/authentication/login/index.html";
  }
}

// Function to update user display when localStorage changes
function updateUserDisplay() {
  const currentUser = getCurrentUser();

  // Check if we have a user
  if (currentUser) {
    // Update the display immediately
    displayUserName();
  } else {
    // Redirect to login if no user found
    window.location.href =
      "/lllingofy/LingoFy-Project/pages/shared/authentication/login/index.html";
  }
}

// Add event listener for localStorage changes
window.addEventListener("storage", function (e) {
  if (e.key === "currentUser") {
    // User changed, update the display
    displayUserName();
  }
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // First, check if we have a user
  const currentUser = getCurrentUser();

  if (currentUser) {
    // User exists, display their name
    displayUserName();
  } else {
    // No user found, redirect to login
    window.location.href =
      "/lllingofy/LingoFy-Project/pages/shared/authentication/login/index.html";
  }
});

// Function to handle form status
function formStatus(status) {
  if (status) {
    return `
            <span class="badge bg-success">
                <i class="bi bi-check-circle me-1"></i>Active
            </span>
        `;
  }
  return `
            <span class="badge bg-secondary d-inline-flex align-items-center">
                <i class="bi bi-x-circle me-1"></i>Inactive
            </span>
        `;
}

// Add the editForm function
function editForm(formId) {
  // Find the form to edit from localStorage
  const formToEdit = formObj.find((form) => form.formId === formId);

  if (!formToEdit) {
    Swal.fire({
      title: "Error!",
      text: "Form not found!",
      icon: "error",
      confirmButtonColor: "#dc3545",
    });
    return;
  }

  // Save the form to edit in localStorage
  localStorage.setItem("editingForm", JSON.stringify(formToEdit));

  // Redirect to form creation page
  window.location.href = "../form-creation/index.html";
}

function activate_deactivate_Btn(id) {
  for (let i = 0; i < formObj.length; i++) {
    if (formObj[i].formId === id) {
      formObj[i].formStatus = !formObj[i].formStatus;
      break;
    }
  }
  localStorage.setItem("forms", JSON.stringify(formObj));
  location.reload();
}

function confirmDelete(deleteId) {
  Swal.fire({
    title: "Are you sure?",
    text: "This form will be permanently deleted!",
    icon: "warning",
    confirmButtonText: "Delete",
    confirmButtonColor: "#dc3545",
    showCancelButton: true,
    cancelButtonColor: "#6c757d",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      for (let i = 0; i < formObj.length; i++) {
        if (formObj[i].formId === deleteId) {
          formObj.splice(i, 1);
          break;
        }
      }
      localStorage.setItem("forms", JSON.stringify(formObj));
      location.reload();
    }
  });
}

// Render the forms table
window.onload = function () {
  const formsTable = document.getElementById("formsTable");
  if (!formsTable) {
    // If table doesn't exist yet, wait a bit
    setTimeout(function () {
      if (document.getElementById("formsTable")) {
        renderFormsTable();
      }
    }, 100);
    return;
  }

  renderFormsTable();
};

function renderFormsTable() {
  const formsTable = document.getElementById("formsTable");
  let num = 1;

  // Clear existing content
  formsTable.innerHTML = "";

  formObj.forEach((form) => {
    let tr = document.createElement("tr");
    tr.innerHTML = `
            <tr>
              <td>${num++}</td>
              <td>${form.formTitle}</td>
              <td>${form.numberOfQuestions}</td>
              <td>${formStatus(form.formStatus)}</td>
              <td>${form.formDate}</td>
              <td>
                  <button class="btn btn-sm btn-outline-primary me-1" title="Edit" onclick="editForm(${
                    form.formId
                  })">
                      <i class="bi bi-pencil"></i> Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger me-1" title="Delete"
                      onclick="confirmDelete(${form.formId})">
                      <i class="bi bi-trash"></i> Delete
                  </button>
                  <button class="btn btn-sm ${
                    form.formStatus
                      ? "btn-outline-secondary"
                      : "btn-outline-success"
                  }" 
                          title="${form.formStatus ? "Deactivate" : "Activate"}"
                          onclick="activate_deactivate_Btn(${form.formId})">
                      <i class="bi ${
                        form.formStatus ? "bi-pause-circle" : "bi-play-circle"
                      }"></i> 
                      ${form.formStatus ? "Deactivate" : "Activate"}
                  </button>
              </td>
          </tr>
        `;
    formsTable.appendChild(tr);
  });
}
