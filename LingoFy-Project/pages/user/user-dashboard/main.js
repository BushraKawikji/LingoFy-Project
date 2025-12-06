let formObj = JSON.parse(localStorage.getItem("forms")) || [];

window.onload = function () {
  const formsTable = document.getElementById("formsTable");

  let num = 1;

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
              <button class="btn btn-sm btn-outline-primary me-1" title="Edit">
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
};

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
