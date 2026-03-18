// === AUTH GUARD ===
// FIX: redirect to login if user is not logged in
(function() {
    if (!localStorage.getItem("loggedInUser")) {
        window.location.href = "../AUTHENTICATION/login.html";
    }
})();

// === STATE VARIABLES ===
// Track selected seats, ticket price, and current event data
let selectedSeats = [];
let seatPrice = 0;
let selectedEvent = null;

/**
 * Loads the selected event details from localStorage and displays them
 * Retrieves event ID, finds matching event from storage, extracts price and details
 * Displays event info (name, date, venue, price) on the page
 */
function loadEventDetails() {
    const eventId = localStorage.getItem("selectedEvent");

    if (!eventId) {
        alert("No event selected.");
        window.location.href = "../USER_DASHBOARD/user_dashboard.html";
        return;
    }

    let storedEvents = localStorage.getItem("tblEvents");

    if (!storedEvents) {
        alert("No events found.");
        return;
    }

    let events = JSON.parse(storedEvents);

    for (let index = 0; index < events.length; index++) {
        if (events[index].id == eventId) {
            selectedEvent = events[index];
            break;
        }
    }

    if (!selectedEvent) {
        alert("Event not found.");
        return;
    }

    // SET PRICE
    seatPrice = selectedEvent.price;

    // DISPLAY EVENT INFO
    document.querySelector(".info-card .card-header").textContent = selectedEvent.name;

    document.querySelector(".info-card .card-body").innerHTML = `
        <p><strong>Date:</strong> ${selectedEvent.date}</p>
        <p><strong>Time:</strong> ${selectedEvent.time}</p>
        <p><strong>Venue:</strong> ${selectedEvent.venue}</p>
        <p><strong>Price:</strong> ₱${selectedEvent.price.toFixed(2)}</p>

        <p class="event-description">
            Enjoy this amazing event and create unforgettable memories!
        </p>
    `;
}

/**
 * Generates the seat layout based on the event's total seats
 * Creates interactive seat elements with 10% random booked seats for demo
 * Each seat can be clicked to select/deselect for booking
 */
function generateSeatLayout() {
    // FIX: guard against null selectedEvent (e.g. if loadEventDetails failed)
    if (!selectedEvent) return;

    const container = document.getElementById("seatContainer");
    container.innerHTML = "";

    // FIX: load real booked seats from localStorage instead of random
    const bookedSeatsRaw = localStorage.getItem("bookedSeats");
    const bookedSeats = bookedSeatsRaw ? JSON.parse(bookedSeatsRaw) : [];

    let totalSeats = selectedEvent.totalSeats;

    for (let index = 1; index <= totalSeats; index++) {
        let seat = document.createElement("div");
        seat.className = "seat";
        seat.id = "seat-" + index;

        // Mark seat as booked if it appears in the stored bookedSeats list
        const seatLabel = "Seat " + index;
        if (bookedSeats.indexOf(seatLabel) !== -1) {
            seat.classList.add("booked");
        }

        seat.onclick = function () {
            selectSeat(index);
        };

        container.appendChild(seat);
    }
}

/**
 * Toggles seat selection state when clicked
 * Skips booked seats (they cannot be selected)
 * Updates selectedSeats array and recalculates total price
 */
function selectSeat(seatId) {
    let seat = document.getElementById("seat-" + seatId);

    if (seat.classList.contains("booked")) return;

    seat.classList.toggle("selected");

    if (seat.classList.contains("selected")) {
        selectedSeats.push(seatId);
    } else {
        selectedSeats = selectedSeats.filter(id => id !== seatId);
    }

    calculateTotalPrice();
}

/**
 * Calculates and displays the total price based on selected seats
 * Multiplies number of selected seats by the price per seat
 * Updates the price display box
 */
function calculateTotalPrice() {
    let total = selectedSeats.length * seatPrice;

    document.getElementById("priceBox").textContent =
        "Total Price: ₱" + total.toFixed(2);
}

/**
 * Validates seat selection, creates booking object, and redirects to checkout
 * Ensures at least one seat is selected before proceeding
 * Stores pending booking data in localStorage for checkout page to access
 */
function proceedToCheckout() {
    if (selectedSeats.length === 0) {
        alert("Please select at least one seat.");
        return;
    }

    var userName = localStorage.getItem("loggedInUser") || "Guest";

    var pendingBooking = {
        userName: userName,
        eventName: selectedEvent.name,
        eventDate: selectedEvent.date,
        eventTime: selectedEvent.time,
        eventVenue: selectedEvent.venue,
        seats: selectedSeats.map(function(id) { return "Seat " + id; }),
        pricePerSeat: selectedEvent.price,
        eventImage: "party_bg.png"
    };

    localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));

    window.location.href = "../MY_BOOKINGS/checkout.html";
}

/**
 * Initializes the page when DOM is fully loaded
 * Loads event details and generates the seat selection layout
 */
window.onload = function () {
    loadEventDetails();
    generateSeatLayout();
};

/**
 * Logs out the current user after confirmation
 * Clears user session data from localStorage and redirects to login page
 */
function logoutUser() {
    let confirmLogout = confirm("Are you sure you want to log out?");

    if (!confirmLogout) return;

    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loggedInUser"); 
    localStorage.removeItem("currentUserRole"); 

    window.location.href = "../AUTHENTICATION/login.html";
}