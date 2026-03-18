/**
 * ForgotPassword class - handles 3-step password reset flow
 * Step 1: verify email exists in storage
 * Step 2: set new password
 * Step 3: success confirmation
 * Logic mirrors signup.js UserAuth class structure
 */
class ForgotPassword {
    constructor() {
        this.userPrefix = "user_";
        this.verifiedEmail = null;
        this.verifiedUserKey = null;
        this.verifiedUserSource = null; // "json" or "prefixed"
    }

    // ---------- STEP 1: verify email ----------
    handleEmailVerification(event) {
        event.preventDefault();

        const email = $("#emailInput").val().trim();
        const result = this.findUserByEmail(email);

        if (!result) {
            this.showError("#errorMsg1", "No account found with that email address.");
            return;
        }

        this.verifiedEmail = email;
        this.verifiedUserKey = result.key;
        this.verifiedUserSource = result.source;

        $("#displayEmail").text(email);
        this.goToStep(2);
    }

    // ---------- STEP 2: reset password ----------
    handlePasswordReset(event) {
        event.preventDefault();

        const newPass = $("#newPasswordInput").val();
        const confirmPass = $("#confirmNewPasswordInput").val();

        if (!this.validatePasswords(newPass, confirmPass)) return;

        this.updatePasswordInStorage(newPass);
        this.goToStep(3);
    }

    // ---------- Validation ----------
    validatePasswords(pass, confirm) {
        if (pass.length < 8) {
            this.showError("#errorMsg2", "Password must be at least 8 characters long.");
            return false;
        }
        if (pass !== confirm) {
            this.showError("#errorMsg2", "Passwords do not match.");
            return false;
        }
        return true;
    }

    // ---------- Storage helpers (mirrors signup.js approach) ----------
    findUserByEmail(email) {
        // Check default "users" JSON array
        const jsonUsers = localStorage.getItem("users");
        if (jsonUsers) {
            try {
                const users = JSON.parse(jsonUsers);
                for (let i = 0; i < users.length; i++) {
                    if (users[i].email === email) {
                        return { key: i, source: "json" };
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // Check pipe-delimited user_N entries created by signup.js
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.userPrefix)) {
                const userData = localStorage.getItem(key);
                const storedEmail = userData.split("|")[1];
                if (storedEmail === email) {
                    return { key: key, source: "prefixed" };
                }
            }
        }

        return null;
    }

    updatePasswordInStorage(newPassword) {
        if (this.verifiedUserSource === "json") {
            const users = JSON.parse(localStorage.getItem("users"));
            users[this.verifiedUserKey].password = newPassword;
            localStorage.setItem("users", JSON.stringify(users));
        } else {
            const userData = localStorage.getItem(this.verifiedUserKey);
            const parts = userData.split("|");
            parts[2] = newPassword; // format: name|email|password|role
            localStorage.setItem(this.verifiedUserKey, parts.join("|"));
        }
    }

    // ---------- UI helpers ----------
    showError(selector, message) {
        $(selector).text(message).show();
    }

    goToStep(stepNumber) {
        $(".step").removeClass("active");
        $("#step" + stepNumber).addClass("active");

        $(".step-dot").removeClass("active");
        for (let i = 1; i <= stepNumber; i++) {
            $("#dot" + i).addClass("active");
        }
    }
}

$(document).ready(() => {
    const fp = new ForgotPassword();

    $("#forgotStep1Form").on("submit", (e) => fp.handleEmailVerification(e));
    $("#forgotStep2Form").on("submit", (e) => fp.handlePasswordReset(e));

    // Clear errors on input
    $("#emailInput").on("input", () => $("#errorMsg1").hide());
    $("#newPasswordInput, #confirmNewPasswordInput").on("input", () => $("#errorMsg2").hide());
});
