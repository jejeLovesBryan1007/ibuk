/**
 * Initialize login status check when DOM is fully loaded
 * Redirects logged-in users directly to the correct dashboard
 */
document.addEventListener("DOMContentLoaded", checkLoginStatus);

/**
 * Checks if user is already logged in by verifying localStorage
 * Redirects admin to admin dashboard, customers to user dashboard
 * FIX: previously always sent everyone to user dashboard
 */
function checkLoginStatus() {
    const currentUser = localStorage.getItem("loggedInUser");
    const currentRole = localStorage.getItem("currentUserRole");

    if (currentUser) {
        if (currentRole === "admin") {
            window.location.href = "ADMIN_DASHBOARD/admin_dashboard.html";
        } else {
            window.location.href = "USER_DASHBOARD/user_dashboard.html";
        }
    }
}

/**
 * Redirects user to login page when Events nav link is clicked
 */
function redirectToLogin(event) {
    event.preventDefault();
    window.location.href = "AUTHENTICATION/login.html";
}

/**
 * Redirects user to registration page when Sign Up button is clicked
 * FIX: was defined but never called — now wired to Sign Up button in index.html
 */
function redirectToRegister(event) {
    event.preventDefault();
    window.location.href = "AUTHENTICATION/signup.html";
}
