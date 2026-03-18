/**
 * UserAuth Class - Manages user registration and validation
 * Handles form validation, duplicate email checking, and storing new users
 */
class UserAuth {
    constructor() {
        this.userCountKey = 'user_count';
        this.userPrefix = 'user_';
    }

    /**
     * Handles the signup form submission
     * Validates input, checks for duplicates, saves user, and redirects to login
     * Displays error alerts if validation fails
     */
    handleRegister(event) {
        event.preventDefault();

        const fullName = $('#fullNameInput').val().trim();
        const email = $('#emailInput').val().trim();
        const password = $('#passwordInput').val();
        const confirmPassword = $('#confirmPasswordInput').val();

        if (!this.validateRegisterForm(fullName, email, password, confirmPassword)) { 
            return;
        }

        if (this.checkDuplicateEmail(email)) {
            alert("This email is already registered.");
            return;
        }

        this.saveUserToStorage(fullName, email, password, "customer"); 

        alert("Registration Successful! Click OK to proceed to Login.");

        $('main').animate({
            marginLeft: '-100%',
            opacity: 0
        },  400, () => {
            window.location.href = "login.html";
        });
    }

    /**
     * Validates the registration form inputs
     * Checks: full name format (first and last name), email, password match, password length
     * Returns true if all validations pass, false otherwise
     */
    validateRegisterForm(name, email, pass, confirm) { 
        if (!name || !email || !pass) {
            alert("Please complete all required fields.");
            return false;
        }
        if (!name.includes(" ")) {
            alert("Invalid format. Please provide both your first and last name.");
            return false;
        }
        if (pass !== confirm) {
            alert("Passwords do not match.");
            return false;
        }
        if (pass.length < 8) {
            alert("Password must be at least 8 characters long.");
            return false;
        }
        return true;
    }

    /**
     * Checks if an email address is already registered
     * Searches both the default users array and dynamically created user entries
     * Returns true if email exists, false if available
     */
    checkDuplicateEmail(email) {
        const jsonUsers = localStorage.getItem("users");
        if (jsonUsers) {
            const users = JSON.parse(jsonUsers);
            for (let index = 0; index < users.length; index++) {
                if (users[index].email === email) return true;
            }
        }

        for (let index = 0; index < localStorage.length; index++) {
            const key = localStorage.key(index);
            if (key && key.startsWith(this.userPrefix)) {
                const userData = localStorage.getItem(key);
                const storedEmail = userData.split('|')[1]; 
                if (storedEmail === email) return true;
            }
        }
        return false;
    }

    /**
     * Saves a new user to localStorage with a unique ID
     * Stores name, email, password, and account type in a pipe-delimited string
     * Increments the user counter for unique ID generation
     */
    saveUserToStorage(name, email, pass, type) {
        let currentCount = parseInt(localStorage.getItem(this.userCountKey)) || 0;
        currentCount++;

        const userString = name + "|" + email + "|" + pass + "|" + type;

        localStorage.setItem(this.userPrefix + currentCount, userString);
        localStorage.setItem(this.userCountKey, currentCount);
    }
}

/**
 * Initialize signup form handler when DOM is ready
 * Creates UserAuth instance and attaches handler to form submission
 */
$(document).ready(() => {
    const auth = new UserAuth();
    $('#signupForm').on('submit', (e) => {
        auth.handleRegister(e);
    });
});