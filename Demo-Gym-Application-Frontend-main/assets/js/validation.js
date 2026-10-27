/* ===================================================================
   GymFlow — Form Validation Helper
   Real-time feedback, field constraints, and error display.
   =================================================================== */

const Validation = {
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  validateRequired(val) {
    if (val === null || val === undefined) return false;
    return String(val).trim().length > 0;
  },

  validateMinLength(val, min) {
    return String(val || '').trim().length >= min;
  },

  validatePhone(phone) {
    const re = /^[\d\+\-\(\)\s]{7,20}$/;
    return re.test(String(phone).trim());
  },

  setFieldError(inputEl, message) {
    inputEl.classList.add('is-invalid');
    const formGroup = inputEl.closest('.form-group') || inputEl.parentElement;
    let feedback = formGroup.querySelector('.invalid-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      formGroup.appendChild(feedback);
    }
    feedback.textContent = message;
    feedback.style.display = 'block';
  },

  clearFieldError(inputEl) {
    inputEl.classList.remove('is-invalid');
    const formGroup = inputEl.closest('.form-group') || inputEl.parentElement;
    const feedback = formGroup.querySelector('.invalid-feedback');
    if (feedback) {
      feedback.style.display = 'none';
      feedback.textContent = '';
    }
  },

  validateForm(formEl) {
    let isValid = true;
    const inputs = formEl.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      this.clearFieldError(input);

      // Required check
      if (input.hasAttribute('required') && !this.validateRequired(input.value)) {
        this.setFieldError(input, 'This field is required.');
        isValid = false;
        return;
      }

      // Email check
      if (input.type === 'email' && input.value.trim() && !this.validateEmail(input.value)) {
        this.setFieldError(input, 'Please enter a valid email address.');
        isValid = false;
        return;
      }

      // Minlength check
      if (input.hasAttribute('minlength')) {
        const min = parseInt(input.getAttribute('minlength'));
        if (input.value && !this.validateMinLength(input.value, min)) {
          this.setFieldError(input, `Must be at least ${min} characters long.`);
          isValid = false;
          return;
        }
      }

      // Password confirmation check
      if (input.dataset.match) {
        const targetInput = formEl.querySelector(input.dataset.match);
        if (targetInput && targetInput.value !== input.value) {
          this.setFieldError(input, 'Passwords do not match.');
          isValid = false;
          return;
        }
      }
    });

    return isValid;
  }
};

window.Validation = Validation;
