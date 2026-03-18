// === AUTH GUARD ===
// FIX: redirect to login if user is not logged in
(function() {
    if (!localStorage.getItem("loggedInUser")) {
        window.location.href = "../AUTHENTICATION/login.html";
    }
})();

// === STATE VARIABLES ===
// Array to store all available events from admin dashboard
let events = [];

/**
 * Initialize user dashboard when DOM is fully loaded
 * Loads events from localStorage and displays them on the page
 */
document.addEventListener("DOMContentLoaded", function() {
    loadEvents();
});

/**
 * Loads events from localStorage (tblEvents)
 * Retrieves events created by admin or initializes empty array if none exist
 * Calls displayEvents() to render events on the page
 */
function loadEvents() {
    // Retrieve stored events from localStorage
    let storedEvents = localStorage.getItem("tblEvents");

    if (storedEvents !== null) {
        events = JSON.parse(storedEvents);
    } else {
        // FIX: seed default events so the user dashboard always has data
        // even if the admin dashboard has never been visited yet.
        // This mirrors the default data in admin_dashboard.js loadDefaults().
        events = [
            { id: 1, name: "PNC Artsfest",      date: "2026-03-20", time: "7:00 PM",  venue: "PNC Gym 1",              price: 350.00, totalSeats: 100, bookedSeats: 0 },
            { id: 2, name: "IEGNITE",            date: "2026-03-25", time: "8:00 AM",  venue: "PNC Gym 2",              price: 500.00, totalSeats: 200, bookedSeats: 0 },
            { id: 3, name: "UCPL Tournament",    date: "2026-04-01", time: "10:00 AM", venue: "University of Makati",   price: 150.00, totalSeats: 300, bookedSeats: 0 },
            { id: 4, name: "CBAA LEAD",          date: "2026-04-10", time: "9:00 AM",  venue: "PNC Gym 1",              price:   0.00, totalSeats: 500, bookedSeats: 0 },
            { id: 5, name: "Sportsfest",         date: "2026-04-15", time: "8:00 PM",  venue: "CABS",                   price: 800.00, totalSeats:  80, bookedSeats: 0 }
        ];
        localStorage.setItem("tblEvents", JSON.stringify(events));
        localStorage.setItem("nextEventId", 6);
    }

    // Display the events on the user interface
    displayEvents();
}

/**
 * Renders all events as card elements in the DOM
 * Each card displays event name, date, venue, price, and a "View Details" button
 * Shows "No events available" message if events array is empty
 */
function displayEvents() {
    // Get the container where event cards will be displayed
    const container = document.getElementById("cardContainer");
    
    // Clear any existing event cards
    container.innerHTML = "";

    // Show message if no events are available
    if (events.length === 0) {
        container.innerHTML = "<p>No events available.</p>";
        return;
    }

    // Loop through each event and create a card element
    for (let index = 0; index < events.length; index++) {
        let ev = events[index];

        // Create a new div element for the event card
        let card = document.createElement("div");
        card.className = "event-card";

        // Set the card's inner HTML with event information and button
        card.innerHTML = `
            <div class="card-header">
                ${ev.name}
            </div>
            <div class="card-body">
                <p><strong>Date:</strong> ${ev.date}</p>
                <p><strong>Venue:</strong> ${ev.venue}</p>
                <p><strong>Price:</strong> P${ev.price.toFixed(2)}</p>
                <button onclick="redirectToEventDetails(${ev.id})">View Details</button>
            </div>
        `;

        // Add the card to the container
        container.appendChild(card);
    }
}

/**
 * Stores selected event ID in localStorage and navigates to event details page
 * Called when user clicks "View Details" button on an event card
 * Passes event ID to event_details.js for displaying full event information and seat selection
 */
function redirectToEventDetails(eventId) {
    localStorage.setItem("selectedEvent", eventId);
    window.location.href = "../EVENT_DETAILS/event_details.html";
}

/**
 * Logs out the current user after confirmation
 * Clears all user session data from both sessionStorage and localStorage
 * Removes: loggedInUser, currentUserRole, and other session identifiers
 * Redirects to login page after successful logout
 */
function logoutUser() {
    // Request user confirmation before logging out
    let confirmLogout = confirm("Are you sure you want to log out?");

    // Exit if user cancels logout
    if (!confirmLogout) return;

    // Clear session and local storage data
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loggedInUser"); 
    localStorage.removeItem("currentUserRole"); 

    // Redirect to login page
    window.location.href = "../AUTHENTICATION/login.html";
}