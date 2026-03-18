// === AUTH GUARD ===
// FIX: redirect to login if user is not logged in or is not an admin
(function() {
    const loggedIn = localStorage.getItem("loggedInUser");
    const role = localStorage.getItem("currentUserRole");
    if (!loggedIn || role !== "admin") {
        window.location.href = "../AUTHENTICATION/login.html";
    }
})();

// === STATE VARIABLES ===
// Arrays to store events and bookings data
let events = [];
let bookings = [];
let nextEventId = 1;
let editingEventId = -1;

// === INPUT FIELD REFERENCES ===
// Get DOM references for form inputs to avoid repeated queries
let eventNameInput = document.getElementById("txtEventName");
let dateInput = document.getElementById("txtDate");
let timeInput = document.getElementById("txtTime"); 
let venueInput = document.getElementById("txtVenue");
let priceInput = document.getElementById("txtPrice");
let totalSeatsInput = document.getElementById("txtTotalSeats");

// Hide update button initially (shown only during edit mode)
$("#updateBtn").hide();

// === EVENT HANDLERS ===
// Handle register/add event button click
$("#registerBtn").on("click", function(e) {
    e.preventDefault();
    addEvent();
});

// Handle update event button click
$("#updateBtn").on("click", function(e) {
    e.preventDefault();
    updateEvent();
});

// Handle dashboard navigation button click
$("#dashboardBtn").on("click", function() {
    setActiveNav("dashboardBtn");
    showSection("dashboard");
});

// Handle manage events navigation button click
$("#manage-eventsBtn").on("click", function() {
    setActiveNav("manage-eventsBtn");
    showSection("manage-events");
});

// Handle manage transactions navigation button click
$("#manage-transactionsBtn").on("click", function() {
    setActiveNav("manage-transactionsBtn");
    showSection("manage-transactions");
});

// Handle logout button click
// FIX: now clears session data before redirecting
$("#logoutBtn").on("click", function() {
    if (confirm("Log out?")) {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("currentUserRole");
        window.location.href = "../AUTHENTICATION/login.html";
    }
});

// Load default data from localStorage or initialize with sample data
loadDefaults();  // ✅ THIS WAS MISSING - NOW ADDED!

/**
 * Loads initial state from localStorage or initializes with default sample data
 * Retrieves events and bookings; if not found, creates default data
 */
function loadDefaults() {
    if (localStorage.getItem("tblEvents") !== null) {
        events = JSON.parse(localStorage.getItem("tblEvents"));
        nextEventId = Number(localStorage.getItem("nextEventId"));
    } else {
        events = [
            { id: 1, name: "PNC Artsfest", date: "2026-03-20", time: "7:00 PM", venue: "PNC Gym 1", price: 350.00, totalSeats: 100, bookedSeats: 0 },
            { id: 2, name: "IEGNITE", date: "2026-03-25", time: "8:00 AM", venue: "PNC Gym 2", price: 500.00, totalSeats: 200, bookedSeats: 0 },
            { id: 3, name: "UCPL Tournament", date: "2026-04-01", time: "10:00 AM", venue: "University of Makati", price: 150.00, totalSeats: 300, bookedSeats: 0 },
            { id: 4, name: "CBAA LEAD", date: "2026-04-10", time: "9:00 AM", venue: "PNC Gym 1", price: 0.00, totalSeats: 500, bookedSeats: 0 },
            { id: 5, name: "Sportsfest", date: "2026-04-15", time: "8:00 PM", venue: "CABS", price: 800.00, totalSeats: 80, bookedSeats: 0 }
        ];
        nextEventId = 6;

        localStorage.setItem("tblEvents", JSON.stringify(events));
        localStorage.setItem("nextEventId", nextEventId);
    }

    if (localStorage.getItem("tblBookings") !== null) {
        bookings = JSON.parse(localStorage.getItem("tblBookings"));
    } else {
        bookings = [
            { id: 1, eventName: "PNC Artsfest", date: "2026-03-20", time: "7:00 PM", venue: "PNC Gym 1", seat: "A1", price: 350.00, quantity: 2, total: 700.00  },
            { id: 2, eventName: "PNC Artsfest", date: "2026-03-20", time: "7:00 PM", venue: "PNC Gym 1", seat: "A2", price: 350.00, quantity: 1, total: 350.00  },
            { id: 3, eventName: "IEGNITE", date: "2026-03-25", time: "8:00 AM", venue: "PNC Gym 2", seat: "B5", price: 500.00, quantity: 3, total: 1500.00 },
            { id: 4, eventName: "UCPL Tournament", date: "2026-04-01", time: "10:00 AM", venue: "University of Makati", seat: "C3", price: 150.00, quantity: 4, total: 600.00  },
            { id: 5, eventName: "Sportsfest", date: "2026-04-15", time: "8:00 PM", venue: "CABS", seat: "D10", price: 800.00, quantity: 2, total: 1600.00 }
        ];

        localStorage.setItem("tblBookings", JSON.stringify(bookings));
    }

    loadAdminState();
    showSection("dashboard");
}

/**
 * Loads and updates the current admin dashboard state based on active navigation
 * Recalculates metrics and displays appropriate section content
 */
function loadAdminState() {
    countTotalEvents();
    countTotalBookings();
    calculateRevenue();
    calculateAvailableSeats();

    let activeBtn = $(".nav.active").attr("id");

    if (activeBtn === "dashboardBtn") {
        loadEventBreakdown();
        loadRecentActivity();
    } else if (activeBtn === "manage-eventsBtn") {
        loadEventsForAdmin();
    } else if (activeBtn === "manage-transactionsBtn") {
        loadTransactionsForAdmin();
    }
}

/**
 * Counts and displays the total number of registered events
 */
function countTotalEvents() {
    $("#totalEvents").text(events.length);
}

/**
 * Counts and displays the total number of bookings made
 */
function countTotalBookings() {
    $("#totalBookings").text(bookings.length);
}

/**
 * Calculates and displays total revenue from all bookings
 * Sums the total price of each booking transaction
 */
function calculateRevenue() {
    let total = 0;
    for (let index = 0; index < bookings.length; index++) {
        total = total + bookings[index].total;
    }
    $("#totalRevenue").text("P" + total.toFixed(2));
}

/**
 * Calculates available seats, booked seats, and occupancy rate across all events
 * Updates the dashboard metrics display
 */
function calculateAvailableSeats() {
    let totalSeats = 0;
    let bookedSeats = 0;

    for (let index = 0; index < events.length; index++) {
        totalSeats += events[index].totalSeats;
    }

    for (let index = 0; index < bookings.length; index++) {
        bookedSeats += bookings[index].quantity;
    }

    let availableSeats = totalSeats - bookedSeats;
    let occupancyPercent = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

    $("#totalAvailableSeats").text(availableSeats);
    $("#totalBookedSeats").text(bookedSeats);
    $("#occupancyRate").text(occupancyPercent + "%");
}

/**
 * Loads and displays detailed breakdown of each event (seats, bookings, occupancy)
 * Calculates occupancy percentage and displays visual progress bars
 */
function loadEventBreakdown() {
    let eventBreakdownBody = $("#eventBreakdownBody");
    eventBreakdownBody.html("");

    if (events.length === 0) {
        eventBreakdownBody.html("<tr><td colspan='6' style='text-align:center;'>No events registered yet.</td></tr>");
        return;
    }

    for (let outer = 0; outer < events.length; outer++) {
        let ev = events[outer];
        
        // Calculate booked seats for this event
        let bookedForEvent = 0;
        for (let inner = 0; inner < bookings.length; inner++) {
            if (bookings[inner].eventName === ev.name) {
                bookedForEvent += bookings[inner].quantity;
            }
        }

        let availableForEvent = ev.totalSeats - bookedForEvent;
        let occupancyPercent = ev.totalSeats > 0 ? Math.round((bookedForEvent / ev.totalSeats) * 100) : 0;
        
        let occupancyClass = '';
        if (occupancyPercent >= 80) occupancyClass = 'very-high';
        else if (occupancyPercent >= 50) occupancyClass = 'high';

        let row = "<tr>";
        row += "<td><strong>" + ev.name + "</strong></td>";
        row += "<td>" + ev.date + "</td>";
        row += "<td>" + ev.totalSeats + "</td>";
        row += "<td>" + bookedForEvent + "</td>";
        row += "<td>" + availableForEvent + "</td>";
        row += "<td>";
        row += "<div class='occupancy-bar'><div class='occupancy-fill " + occupancyClass + "' style='width: " + occupancyPercent + "%'></div></div>";
        row += "<small style='color: rgba(255, 255, 255, 0.6);'>" + occupancyPercent + "%</small>";
        row += "</td>";
        row += "</tr>";

        eventBreakdownBody.append(row);
    }
}

/**
 * Loads and displays the most recent 5 booking transactions
 * Shows event name, date, seat, quantity, and total amount
 */
function loadRecentActivity() {
    let activityContainer = $("#recentActivityContainer");
    activityContainer.html("");

    if (bookings.length === 0) {
        activityContainer.html("<p style='text-align: center; color: rgba(255, 255, 255, 0.6);'>No recent transactions</p>");
        return;
    }

    // Show last 5 transactions
    let recentBookings = bookings.slice(-5).reverse();

    for (let inner = 0; inner < recentBookings.length; inner++) {
        let book = recentBookings[inner];
        let activityHtml = `
            <div class="activity-item">
                <div class="activity-info">
                    <div class="activity-event">` + book.eventName + `</div>
                    <div class="activity-details">` + book.date + ` • ` + book.seat + ` • Qty: ` + book.quantity + `</div>
                </div>
                <div class="activity-amount">P` + book.total.toFixed(2) + `</div>
            </div>
        `;
        activityContainer.append(activityHtml);
    }
}

/**
 * Populates the events table with all registered events
 * Includes edit and delete action buttons for each event
 */
function loadEventsForAdmin() {
    let eventsBody = $(".table-box table").eq(0).find("tbody");
    eventsBody.html("");

    if (events.length === 0) {
        eventsBody.html("<tr><td colspan='7' style='text-align:center;'>No events registered yet.</td></tr>");
        return;
    }

    let tableRows = "";

    for (let index = 0; index < events.length; index++) {
        let ev = events[index];
        tableRows += "<tr>";
        tableRows += "<td>" + ev.name + "</td>";
        tableRows += "<td>" + ev.date + "</td>";
        tableRows += "<td>" + ev.time + "</td>";
        tableRows += "<td>" + ev.venue + "</td>";
        tableRows += "<td>P" + ev.price.toFixed(2) + "</td>";
        tableRows += "<td>" + ev.totalSeats + "</td>";
        tableRows += "<td>";
        tableRows += "<button class='edit' onclick='editEvent(" + ev.id + ")'>Edit</button>";
        tableRows += "<button class='delete' onclick='deleteEvent(" + ev.id + ")'>Delete</button>";
        tableRows += "</td>";
        tableRows += "</tr>";
    }

    eventsBody.html(tableRows);
}

/**
 * Populates the transactions table with all booking records
 * Shows event details, seat, price, quantity, and total; includes delete button
 */
function loadTransactionsForAdmin() {
    let transactionsBody = $(".table-box table").eq(1).find("tbody");
    transactionsBody.html("");

    if (bookings.length === 0) {
        transactionsBody.html("<tr><td colspan='9' style='text-align:center;'>No transactions yet.</td></tr>");
        return;
    }

    let tableRows = "";

    for (let index = 0; index < bookings.length; index++) {
        let book = bookings[index];
        tableRows += "<tr>";
        tableRows += "<td>" + book.eventName + "</td>";
        tableRows += "<td>" + book.date + "</td>";
        tableRows += "<td>" + book.time + "</td>";
        tableRows += "<td>" + book.venue + "</td>";
        tableRows += "<td>" + book.seat + "</td>";
        tableRows += "<td>P" + book.price.toFixed(2) + "</td>";
        tableRows += "<td>" + book.quantity + "</td>";
        tableRows += "<td>P" + book.total.toFixed(2) + "</td>";
        tableRows += "<td><button class='delete' onclick='deleteBooking(" + book.id + ")'>Delete</button></td>";
        tableRows += "</tr>";
    }
    transactionsBody.html(tableRows);
}

/**
 * Adds a new event to the events array
 * Validates all form fields before creating the event
 * Updates localStorage and refreshes the dashboard display
 */
function addEvent() {
    if (eventNameInput.value === "" || dateInput.value === "" || timeInput.value === "" ||
        venueInput.value === "" || priceInput.value === "" || totalSeatsInput.value === "") {
        alert("Please fill in all fields!");
        return;
    }

    if (isNaN(parseFloat(priceInput.value)) || parseFloat(priceInput.value) < 0) {
        alert("Please enter a valid price.");
        return;
    }

    if (isNaN(parseInt(totalSeatsInput.value)) || parseInt(totalSeatsInput.value) < 1) {
        alert("Please enter a valid number of seats.");
        return;
    }

    events.push({
        id: nextEventId,
        name: eventNameInput.value,
        date: dateInput.value,
        time: timeInput.value,
        venue: venueInput.value,
        price: parseFloat(priceInput.value),
        totalSeats: parseInt(totalSeatsInput.value),
        bookedSeats: 0
    });

    nextEventId = nextEventId + 1;

    saveEventsToStorage();
    clearForm();
    loadAdminState();
    alert("Event added successfully!");
}

/**
 * Loads an event's data into the form for editing
 * Sets the editing state and switches button visibility (register → update)
 * Scrolls the form into view for user convenience
 */
function editEvent(eventId) {
    let event = null;
    for (let index = 0; index < events.length; index++) {
        if (events[index].id === eventId) {
            event = events[index];
            break;
        }
    }

    eventNameInput.value = event.name;
    dateInput.value = event.date;
    timeInput.value = event.time;
    venueInput.value = event.venue;
    priceInput.value = event.price;
    totalSeatsInput.value = event.totalSeats;

    editingEventId = eventId;
    $("#registerBtn").hide();
    $("#updateBtn").show();

    $(".form-box")[0].scrollIntoView();
}

/**
 * Updates an existing event with new information from the form
 * Validates fields, finds the event by ID, and updates its properties
 * Exits edit mode and refreshes the display
 */
function updateEvent() {
    if (eventNameInput.value === "" || dateInput.value === "" || timeInput.value === "" ||
        venueInput.value === "" || priceInput.value === "" || totalSeatsInput.value === "") {
        alert("Please fill in all fields!");
        return;
    }

    let indexUpdate = -1;
    for (let index = 0; index < events.length; index++) {
        if (events[index].id === editingEventId) {
            indexUpdate = index;
            break;
        }
    }

    events[indexUpdate].name = eventNameInput.value;
    events[indexUpdate].date = dateInput.value;
    events[indexUpdate].time = timeInput.value;
    events[indexUpdate].venue = venueInput.value;
    events[indexUpdate].price = parseFloat(priceInput.value);
    events[indexUpdate].totalSeats = parseInt(totalSeatsInput.value);

    editingEventId = -1;
    $("#registerBtn").show();
    $("#updateBtn").hide();

    saveEventsToStorage();
    clearForm();
    loadAdminState();
    alert("Event updated successfully!");
}

/**
 * Deletes an event from the events array after user confirmation
 * If event is currently being edited, resets edit mode
 * Updates localStorage and refreshes the display
 */
function deleteEvent(eventId) {
    let selectedName = "";
    for (let index = 0; index < events.length; index++) {
        if (events[index].id === eventId) {
            selectedName = events[index].name;
            break;
        }
    }

    if (!confirm("Are you sure you want to delete " + selectedName + "?")) {
        return;
    }

    let updatedEvents = [];
    for (let index = 0; index < events.length; index++) {
        if (events[index].id !== eventId) {
            updatedEvents.push(events[index]);
        }
    }
    events = updatedEvents;

    if (editingEventId === eventId) {
        editingEventId = -1;
        $("#registerBtn").show();
        $("#updateBtn").hide();
        clearForm();
    }

    saveEventsToStorage();
    loadAdminState();
    alert("Event deleted successfully!");
}

/**
 * Deletes a booking transaction from the bookings array after user confirmation
 * Updates localStorage and refreshes the dashboard display
 */
function deleteBooking(bookingId) {
    let selectedName = "";
    for (let index = 0; index < bookings.length; index++) {
        if (bookings[index].id === bookingId) {
            selectedName = bookings[index].eventName;
            break;
        }
    }

    if (!confirm("Are you sure you want to delete the booking for " + selectedName + "?")) {
        return;
    }

    let updatedBookings = [];
    for (let index = 0; index < bookings.length; index++) {
        if (bookings[index].id !== bookingId) {
            updatedBookings.push(bookings[index]);
        }
    }
    bookings = updatedBookings;

    localStorage.setItem("tblBookings", JSON.stringify(bookings));
    loadAdminState();
    alert("Booking deleted successfully!");
}

/**
 * Persists the events array and nextEventId counter to localStorage
 * Called after any event modification (add, edit, delete)
 */
function saveEventsToStorage() {
    localStorage.setItem("tblEvents", JSON.stringify(events));
    localStorage.setItem("nextEventId", nextEventId);
}

/**
 * Clears all form input fields to reset the event registration form
 */
function clearForm() {
    eventNameInput.value = "";
    dateInput.value = "";
    timeInput.value = "";
    venueInput.value = "";
    priceInput.value = "";
    totalSeatsInput.value = "";
}

/**
 * Updates the active navigation button styling
 * Removes active class from all nav buttons and applies it to the selected one
 */
function setActiveNav(activeId) {
    $(".nav").removeClass("active");
    $("#" + activeId).addClass("active");
}

/**
 * Shows the specified dashboard section and hides others
 * Loads the appropriate data for the selected section (dashboard, events, or transactions)
 */
function showSection(section) {
    $("#section-dashboard").hide();
    $("#section-manage-events").hide();
    $("#section-manage-transactions").hide();

    if (section === "dashboard") {
        countTotalEvents();
        countTotalBookings();
        calculateRevenue();
        calculateAvailableSeats();
        loadEventBreakdown();
        loadRecentActivity();
        $("#section-dashboard").show();
    } else if (section === "manage-events") {
        loadEventsForAdmin();
        $("#section-manage-events").show();
    } else if (section === "manage-transactions") {
        loadTransactionsForAdmin();
        $("#section-manage-transactions").show();
    }
}