/* =========================================
   1. SAVE LOGIN DETAILS
========================================= */

// Store the token and username after successful login.

function saveLogin(token, name) {

    localStorage.setItem("token", token);

    localStorage.setItem("name", name);
}


/* =========================================
   2. GET LOGIN DETAILS
========================================= */

// Get the saved token.

function getToken() {

    return localStorage.getItem("token");
}


// Get the saved username.

function getName() {

    return localStorage.getItem("name");
}


/* =========================================
   3. CHECK LOGIN STATUS
========================================= */

// Check whether a user is currently logged in.

function isLoggedIn() {

    return Boolean(getToken());
}


/* =========================================
   4. LOGOUT
========================================= */

// Remove login details and return to login page.

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("name");

    window.location.href = "login.html";
}


/* =========================================
   5. PROTECT PRIVATE PAGES
========================================= */

// Prevent users from accessing protected pages
// without logging in.

function requireLogin() {

    if (!isLoggedIn()) {

        window.location.href = "login.html";

        return false;
    }

    return true;
}