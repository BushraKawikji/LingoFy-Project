// Register page functionality

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
  const registerForm = document.getElementById("registerForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const passwordFeedbackContainer = document.getElementById("passwordFeedback"); // This should be a div that shows live validation

  // Toggle password visibility
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      const icon = togglePassword.querySelector("i");
      icon.classList.toggle("bi-eye");
      icon.classList.toggle("bi-eye-slash");
    });
  }

  // Live password validation - show requirements as user types
  if (passwordInput && passwordFeedbackContainer) {
    passwordInput.addEventListener("input", function () {
      const password = this.value;
      const requirements = validatePassword(password);

      // Clear previous feedback
      passwordFeedbackContainer.innerHTML = "";

      // Show all requirements with checkmarks or X marks
      const lengthReq = document.createElement("div");
      lengthReq.innerHTML =
        password.length >= 8
          ? '<span style="color: green;">✓</span> Must be at least 8 characters!'
          : '<span style="color: red;">✗</span> Must be at least 8 characters!';
      passwordFeedbackContainer.appendChild(lengthReq);

      const numberReq = document.createElement("div");
      numberReq.innerHTML = /[0-9]/.test(password)
        ? '<span style="color: green;">✓</span> Must contain at least 1 number!'
        : '<span style="color: red;">✗</span> Must contain at least 1 number!';
      passwordFeedbackContainer.appendChild(numberReq);

      const uppercaseReq = document.createElement("div");
      uppercaseReq.innerHTML = /[A-Z]/.test(password)
        ? '<span style="color: green;">✓</span> Must contain at least 1 Capital Letter!'
        : '<span style="color: red;">✗</span> Must contain at least 1 Capital Letter!';
      passwordFeedbackContainer.appendChild(uppercaseReq);

      const lowercaseReq = document.createElement("div");
      lowercaseReq.innerHTML = /[a-z]/.test(password)
        ? '<span style="color: green;">✓</span> Must contain at least 1 Small Letter!'
        : '<span style="color: red;">✗</span> Must contain at least 1 Small Letter!';
      passwordFeedbackContainer.appendChild(lowercaseReq);

      const specialCharReq = document.createElement("div");
      specialCharReq.innerHTML = /[@$!%*?&]/.test(password)
        ? '<span style="color: green;">✓</span> Must contain at least 1 Special Character!'
        : '<span style="color: red;">✗</span> Must contain at least 1 Special Character!';
      passwordFeedbackContainer.appendChild(specialCharReq);

      // Update input field styling based on validation
      if (requirements.length === 0) {
        this.classList.remove("is-invalid");
        this.classList.add("is-valid");
      } else {
        this.classList.remove("is-valid");
        this.classList.add("is-invalid");
      }
    });
  }

  // Form validation
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Clear previous validation
      clearValidation("registerForm");

      // Validate all required fields first
      const requiredInputs = registerForm.querySelectorAll(
        "input[required], select[required]"
      );
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
          fullName: document.getElementById("fullName").value,
          email: document.getElementById("email").value,
          password: passwordInput.value,
          role: document.getElementById("role").value,
        };

        // Email validation using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          // Show error for email field
          const emailInput = document.getElementById("email");
          emailInput.classList.add("is-invalid");
          const emailFeedback = emailInput.parentElement.nextElementSibling;
          if (emailFeedback) {
            emailFeedback.classList.remove("d-none");
            emailFeedback.textContent = "Please enter a valid email address";
          }
          // Show SweetAlert error
          Swal.fire({
            icon: "error",
            title: "Invalid Email",
            text: "Please enter a valid email address",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
          return;
        }

        // Password validation using regex and show specific errors
        const validationErrors = validatePassword(formData.password);
        if (validationErrors.length > 0) {
          // Show error for password field
          passwordInput.classList.add("is-invalid");
          const passwordFeedback =
            passwordInput.parentElement.nextElementSibling;
          if (passwordFeedback) {
            passwordFeedback.classList.remove("d-none");
            passwordFeedback.innerHTML = validationErrors.join("<br>");
          }
          // Show SweetAlert error
          Swal.fire({
            icon: "error",
            title: "Password Requirements Not Met",
            html: validationErrors.join("<br>"),
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
          return;
        }

        // Check if user already exists
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const userExists = users.some((user) => user.email === formData.email);
        if (userExists) {
          // Show error for email field
          const emailInput = document.getElementById("email");
          emailInput.classList.add("is-invalid");
          const emailFeedback = emailInput.parentElement.nextElementSibling;
          if (emailFeedback) {
            emailFeedback.classList.remove("d-none");
            emailFeedback.textContent = "Email already registered";
          }
          // Show SweetAlert error
          Swal.fire({
            icon: "error",
            title: "Email Already Registered",
            text: "This email address is already in use",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          });
          return;
        }

        // Create user object with additional fields
        const userToSave = {
          id: Date.now(),
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password, // ⚠️ Remember: never store plain text passwords in real apps!
          role: formData.role,
          createdAt: new Date().toISOString(),
        };

        // Save user to localStorage
        users.push(userToSave);
        localStorage.setItem("users", JSON.stringify(users));

        // Show success message with SweetAlert
        Swal.fire({
          icon: "success",
          title: "Account Created Successfully!",
          text: "Your account has been created successfully. Redirecting...",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        }).then((result) => {
          if (
            result.isConfirmed ||
            result.dismiss === Swal.DismissReason.timer
          ) {
            // Redirect based on role
            if (userToSave.role === "admin") {
              window.location.href = "/pages/admin/admin-dashboard/index.html"; // Admin dashboard
            } else {
              window.location.href = "/pages/user/user-dashboard/index.html"; // Student dashboard
            }
          }
        });
      } else {
        // Show SweetAlert warning
        Swal.fire({
          icon: "warning",
          title: "Missing Required Fields",
          text: "Please fill in all required fields",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
      }
    });

    // Real-time validation for other fields
    const inputs = registerForm.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        if (this.hasAttribute("required") && !this.value.trim()) {
          this.classList.add("is-invalid");
          const feedback = this.parentElement.nextElementSibling;
          if (feedback && feedback.classList.contains("invalid-feedback")) {
            feedback.classList.remove("d-none");
          }
        } else {
          // Additional real-time validation for email
          if (this.id === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
              this.classList.add("is-invalid");
              const feedback = this.parentElement.nextElementSibling;
              if (feedback && feedback.classList.contains("invalid-feedback")) {
                feedback.classList.remove("d-none");
                feedback.textContent = "Please enter a valid email address";
              }
            } else if (this.value) {
              this.classList.remove("is-invalid");
              this.classList.add("is-valid");
              const feedback = this.parentElement.nextElementSibling;
              if (feedback && feedback.classList.contains("invalid-feedback")) {
                feedback.classList.add("d-none");
              }
            }
          } else {
            this.classList.remove("is-invalid");
            this.classList.add("is-valid");
          }
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

// Function to validate password and return specific error messages
function validatePassword(password) {
  const errors = [];

  // Check minimum length (8 characters)
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number (0-9)");
  }

  // Check for at least one special character
  if (!/[@$!%*?&]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  }

  return errors;
}
