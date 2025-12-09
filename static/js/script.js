// Login Form Validation and UX Enhancements

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const submitBtn = document.getElementById('submitBtn');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    
    // Toggle Password Visibility
    if (togglePasswordBtn) {
        const eyeOpenIcon = '<path d="M10 4C6 4 3.27 6.11 2 9C3.27 11.89 6 14 10 14C14 14 16.73 11.89 18 9C16.73 6.11 14 4 10 4ZM10 12C8.34 12 7 10.66 7 9C7 7.34 8.34 6 10 6C11.66 6 13 7.34 13 9C13 10.66 11.66 12 10 12ZM10 7.5C9.17 7.5 8.5 8.17 8.5 9C8.5 9.83 9.17 10.5 10 10.5C10.83 10.5 11.5 9.83 11.5 9C11.5 8.17 10.83 7.5 10 7.5Z" fill="currentColor" id="eyeIcon"/>';
        const eyeClosedIcon = '<path d="M2 2L18 18M10 4C6 4 3.27 6.11 2 9C3.27 11.89 6 14 10 14C11.5 14 12.8 13.5 13.9 12.7M15.5 14.3C14.2 15.2 12.6 15.7 10 15.7C6 15.7 3.27 13.59 2 10.7C2.5 9.5 3.2 8.4 4.1 7.5M5.7 9.1C5.2 9.7 4.8 10.3 4.5 11C5.2 11.7 6 12.2 6.9 12.5M8.5 14.1C7.8 14.3 7 14.4 6.2 14.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="eyeIcon"/>';
        
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Update icon
            const svg = togglePasswordBtn.querySelector('svg');
            if (type === 'text') {
                svg.innerHTML = eyeClosedIcon;
            } else {
                svg.innerHTML = eyeOpenIcon;
            }
        });
    }
    
    // Real-time Validation
    function validateUsername() {
        const username = usernameInput.value.trim();
        if (username.length === 0) {
            showError(usernameInput, usernameError, 'Username or email is required');
            return false;
        } else if (username.length < 3) {
            showError(usernameInput, usernameError, 'Username must be at least 3 characters');
            return false;
        } else {
            hideError(usernameInput, usernameError);
            return true;
        }
    }
    
    function validatePassword() {
        const password = passwordInput.value;
        if (password.length === 0) {
            showError(passwordInput, passwordError, 'Password is required');
            return false;
        } else if (password.length < 6) {
            showError(passwordInput, passwordError, 'Password must be at least 6 characters');
            return false;
        } else {
            hideError(passwordInput, passwordError);
            return true;
        }
    }
    
    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    function hideError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
    
    // Event Listeners for Real-time Validation
    usernameInput.addEventListener('blur', validateUsername);
    usernameInput.addEventListener('input', function() {
        if (usernameInput.classList.contains('error')) {
            validateUsername();
        }
    });
    
    passwordInput.addEventListener('blur', validatePassword);
    passwordInput.addEventListener('input', function() {
        if (passwordInput.classList.contains('error')) {
            validatePassword();
        }
    });
    
    // Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // Clear previous errors
            hideError(usernameInput, usernameError);
            hideError(passwordInput, passwordError);
            
            // Validate all fields
            const isUsernameValid = validateUsername();
            const isPasswordValid = validatePassword();
            
            if (!isUsernameValid || !isPasswordValid) {
                e.preventDefault();
                return false;
            }
            
            // Show loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // If form is valid, it will submit normally
            // The loading state will be reset if there's an error (handled by Django messages)
        });
    }
    
    // Clear errors on input focus
    usernameInput.addEventListener('focus', function() {
        if (usernameInput.classList.contains('error') && usernameInput.value.trim().length > 0) {
            hideError(usernameInput, usernameError);
        }
    });
    
    passwordInput.addEventListener('focus', function() {
        if (passwordInput.classList.contains('error') && passwordInput.value.length > 0) {
            hideError(passwordInput, passwordError);
        }
    });
    
    // Enter key to submit
    loginForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitBtn.click();
        }
    });
    
    // Smooth scroll to first error on validation failure
    function scrollToFirstError() {
        const firstError = document.querySelector('.form-input.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }
    
    // Add animation to form inputs on page load
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach((input, index) => {
        input.style.opacity = '0';
        input.style.transform = 'translateY(10px)';
        setTimeout(() => {
            input.style.transition = 'all 0.4s ease';
            input.style.opacity = '1';
            input.style.transform = 'translateY(0)';
        }, 600 + (index * 100));
    });
});

