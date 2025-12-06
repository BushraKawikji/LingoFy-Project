// Login page functionality

// Add this function to clear validation
function clearValidation(formId) {
  const form = document.getElementById(formId);
  if (form) {
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.classList.remove("is-invalid", "is-valid");
      // Hide any error messages
      const feedback = input.parentElement.nextElementSibling;
      if (feedback && feedback.classList.contains("invalid-feedback")) {
        feedback.classList.add("d-none");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const toggleLoginPassword = document.getElementById("toggleLoginPassword");
  const loginPasswordInput = document.getElementById("loginPassword");

  // Toggle login password visibility
  if (toggleLoginPassword && loginPasswordInput) {
    toggleLoginPassword.addEventListener("click", function () {
      const type =
        loginPasswordInput.getAttribute("type") === "password"
          ? "text"
          : "password";
      loginPasswordInput.setAttribute("type", type);

      const icon = toggleLoginPassword.querySelector("i");
      icon.classList.toggle("bi-eye");
      icon.classList.toggle("bi-eye-slash");
    });
  }

  // Form validation
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Clear previous validation
      clearValidation("loginForm");

      // Validate all required fields first
      const requiredInputs = loginForm.querySelectorAll("input[required]");
      let allRequiredValid = true;

      requiredInputs.forEach((input) => {
        if (!input.value.trim()) {
          allRequiredValid = false;
          input.classList.add("is-invalid");
          const feedback = input.parentElement.nextElementSibling;
          if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.classList.remove("d-none");
          }
        } else {
          input.classList.remove("is-invalid");
          input.classList.add("is-valid");
        }
      });

      // Only proceed if all required fields are filled
      if (allRequiredValid) {
        // Get form data
        const formData = {
          username: document.getElementById("username").value,
          password: loginPasswordInput.value,
        };

        // Validate credentials against localStorage
        const user = validateUser(formData.username, formData.password);

        if (user) {
          // Login successful
          // Save current user to localStorage
          localStorage.setItem("currentUser", JSON.stringify(user));

          // Show success message
          Swal.fire({
            icon: "success",
            title: "Login Successful!",
            text: `Welcome back, ${user.fullName}!`,
            confirmButtonColor: "#28a745",
            confirmButtonText: "Continue",
          }).then((result) => {
            if (
              result.isConfirmed ||
              result.dismiss === Swal.DismissReason.timer
            ) {
              // Redirect based on user role
              if (user.role === "admin") {
                window.location.href =
                  "/pages/admin/admin-dashboard/index.html";
              } else {
                window.location.href = "/pages/user/user-dashboard/index.html";
              }
            }
          });
        } else {
          // Login failed
          // Show error message
          Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Invalid username or password. Please try again.",
            confirmButtonColor: "#dc3545",
            confirmButtonText: "OK",
          });

          // Add error styling to the form fields
          const usernameInput = document.getElementById("username");
          const passwordInput = document.getElementById("loginPassword");

          usernameInput.classList.add("is-invalid");
          passwordInput.classList.add("is-invalid");

          // Show error messages
          const usernameFeedback =
            usernameInput.parentElement.nextElementSibling;
          const passwordFeedback =
            passwordInput.parentElement.nextElementSibling;

          if (usernameFeedback) {
            usernameFeedback.classList.remove("d-none");
            usernameFeedback.textContent = "Invalid username or password";
          }

          if (passwordFeedback) {
            passwordFeedback.classList.remove("d-none");
            passwordFeedback.textContent = "Invalid username or password";
          }
        }
      } else {
        // Show SweetAlert warning for missing fields
        Swal.fire({
          icon: "warning",
          title: "Missing Required Fields",
          text: "Please fill in all required fields",
          confirmButtonColor: "#ffc107",
          confirmButtonText: "OK",
        });
      }
    });

    // Real-time validation for login fields
    const inputs = loginForm.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        if (this.hasAttribute("required") && !this.value.trim()) {
          this.classList.add("is-invalid");
          const feedback = this.parentElement.nextElementSibling;
          if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.classList.remove("d-none");
          }
        } else {
          this.classList.remove("is-invalid");
          this.classList.add("is-valid");
        }
      });

      input.addEventListener("input", function () {
        if (this.classList.contains("is-invalid")) {
          this.classList.remove("is-invalid");
          const feedback = this.parentElement.nextElementSibling;
          if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.classList.add("d-none");
          }
        }
      });
    });
  }
});

// Function to validate user credentials against localStorage
function validateUser(username, password) {
  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Find user by username (or email if they used email as username)
  const user = users.find(
    (u) => u.email === username || u.fullName === username
  );

  // If user found and password matches, return user object
  if (user && user.password === password) {
    return user;
  }

  return null; // Return null if no match found
}
