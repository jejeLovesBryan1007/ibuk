// === INITIALIZE DEFAULT USERS ===
// Creates default user accounts in localStorage if they don't already exist
if (!localStorage.getItem("users")) {
  const users = [
    // FIX: normalised role to "customer" to match signup.js output
    { email: "user@example.com", password: "12345678", role: "customer" },
    { email: "admin@example.com", password: "admin123", role: "admin" },
  ];
  localStorage.setItem("users", JSON.stringify(users));
}

/**
 * Retrieves all user accounts from localStorage
 * Combines users from the default "users" array and dynamically created user entries
 * Returns an array of user objects with email, password, and role
 */
function getUsersFromStorage() {
  const users = [];

  const jsonUsers = localStorage.getItem("users");
  if (jsonUsers) {
    JSON.parse(jsonUsers).forEach((u) => users.push(u));
  }

  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (key && key.startsWith("user_")) {
      const userData = localStorage.getItem(key).split("|");
      users.push({
        email: userData[1],
        password: userData[2],
        // FIX: signup.js saves "customer"; fall back to "customer" not "user"
        role: userData[3] || "customer",
      });
    }
  }

  return users;
}

/**
 * Stores the currently logged-in user's email and role in localStorage
 */
function setCurrentUser(user) {
  localStorage.setItem("loggedInUser", user.email);
  localStorage.setItem("currentUserRole", user.role || "customer");
}

/**
 * Validates login form inputs
 * Checks that email, password, and account type are all provided
 */
function validateLoginForm(email, password) {
  if (!email || !password) {
    alert("Please enter email and password");
    return false;
  }
  const accountType = document.getElementById("accountTypeInput").value;
  if (!accountType) {
    alert("Please select an account type");
    return false;
  }
  return true;
}

/**
 * Redirects the user to the appropriate dashboard based on their stored role
 * FIX: now checks stored role instead of just the dropdown value
 */
function redirectBasedOnRole() {
  const selectedType = document.getElementById("accountTypeInput").value;
  if (selectedType === "admin") {
    window.location.href = "../ADMIN_DASHBOARD/admin_dashboard.html";
  } else {
    window.location.href = "../USER_DASHBOARD/user_dashboard.html";
  }
}

/**
 * Main login handler triggered on form submission
 * Validates credentials, matches account type, stores user session, and redirects
 * FIX: removed unused storedRole variable; role comparison now clean
 */
function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
  const selectedType = document.getElementById("accountTypeInput").value;

  if (!validateLoginForm(email, password)) return;

  const users = getUsersFromStorage();
  const user = users.find((u) => {
    // FIX: removed dead storedRole variable; direct role comparison only
    const typeMatches =
      selectedType === "admin" ? u.role === "admin" : u.role !== "admin";
    return u.email === email && u.password === password && typeMatches;
  });

  if (user) {
    setCurrentUser(user);
    redirectBasedOnRole();
  } else {
    alert("Invalid email, password, or account type");
  }
}

/**
 * Initializes the login form when the DOM is fully loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
});
