// === AUTH GUARD ===
// FIX: redirect to login if user is not logged in
(function() {
    if (!localStorage.getItem("loggedInUser")) {
        window.location.href = "../AUTHENTICATION/login.html";
    }
})();

/**
 * Ticket Page Initialization
 * Loads booking data from localStorage and displays ticket information
 * Supports navigation between multiple bookings and QR code generation
 */
$(document).ready(function () {

    // === STATE VARIABLES ===
    // Retrieve the selected booking ID (if coming from booking.js) and load all bookings
    var bookingId = localStorage.getItem("selectedBooking");
    var bookings = [];
    var currentBookingIndex = 0;

    // === LOAD BOOKINGS FROM STORAGE ===
    // Load all bookings from localStorage
    var bookingsRaw = localStorage.getItem("bookings");
    if (bookingsRaw) {
        bookings = JSON.parse(bookingsRaw);
    }

    // Fallback: use latestBooking (coming straight from checkout)
    if (bookings.length === 0) {
        var latestRaw = localStorage.getItem("latestBooking");
        if (latestRaw) {
            bookings = [JSON.parse(latestRaw)];
        }
    }

    // Show error if no bookings found
    if (bookings.length === 0) {
        alert("No booking record found.");
        window.location.href = "../MY_BOOKINGS/booking.html";
        return;
    }

    // === FIND SELECTED BOOKING ===
    // Find the selected booking by ID or default to first booking
    if (bookingId) {
        for (var index = 0; index < bookings.length; index++) {
            if (String(bookings[index].bookingId) === String(bookingId)) {
                currentBookingIndex = index;
                break;
            }
        }
    }

    /**
     * Displays a booking's information on the ticket
     * Updates both the main ticket display and the side summary
     * Shows status as BOOKED or CANCELLED with appropriate styling
     */
    function displayBooking(index) {
        if (index < 0 || index >= bookings.length) return;
        
        currentBookingIndex = index;
        var booking = bookings[currentBookingIndex];

        // Display in Main Ticket Section (Left Side)
        $('#MainEventName').text(booking.eventName);
        $('#MainEventDate').text(booking.eventDate);
        $('#MainEventVenue').text(booking.eventVenue);

        // Status logic
        // FIX: check both 'Confirmed' (from restore) and 'confirmed' (legacy) and 'Active'
        if (booking.status === 'Confirmed' || booking.status === 'confirmed' || booking.status === 'Active') {
            $('#MainStatus').text('BOOKED').css({
                'color': '#28a745',
                'font-weight': 'bold',
                'text-transform': 'uppercase'
            });
            $('.ticket-container').css('opacity', '1');
        } else if (booking.status === 'Cancelled') {
            $('#MainStatus').text('CANCELLED').css({
                'color': '#ff4d4d',
                'font-weight': 'bold'
            });
            $('.ticket-container').css('opacity', '0.5');
        } else {
            $('#MainStatus').text(booking.status);
        }

        // Display in Ticket Side Summary (Right Side)
        $('#EventName').text(booking.eventName);
        $('#EventTime').text(booking.eventTime || booking.eventVenue);
        $('#EventDate').text(booking.eventDate);
        $('#EventPrice').text("Order ID: #" + booking.bookingId);
        
        // Deduplicate seats
        var uniqueSeats = [...new Set(booking.seats)];
        $('#EventSeat').text("Seats: " + uniqueSeats.join(", "));

        // Update carousel counter if multiple bookings
        if (bookings.length > 1) {
            $('#ticketCounter').text((currentBookingIndex + 1) + ' / ' + bookings.length);
            $('#ticketNavigation').show();
        } else {
            $('#ticketNavigation').hide();
        }
    }

    // === INITIAL DISPLAY ===
    // Display the selected or first booking when page loads
    displayBooking(currentBookingIndex);

    // === TICKET NAVIGATION CONTROLS ===
    /**
     * Navigate to previous booking in the carousel
     * Wraps around to last booking if at beginning
     */
    $('#ticketPrev').on('click', function() {
        displayBooking((currentBookingIndex - 1 + bookings.length) % bookings.length);
    });

    /**
     * Navigate to next booking in the carousel
     * Wraps around to first booking if at end
     */
    $('#ticketNext').on('click', function() {
        displayBooking((currentBookingIndex + 1) % bookings.length);
    });

    // === QR CODE GENERATION ===
    /**
     * Opens QR code modal and generates QR code for current booking
     * QR contains booking ID, event name, date, and seat information
     */
    $('.qrCode').on('click', function() {
        var booking = bookings[currentBookingIndex];

        $('#qrcode').empty();

        var qrData = JSON.stringify({
            bookingId: booking.bookingId,
            event: booking.eventName,
            date: booking.eventDate,
            seats: booking.seats
        });

        new QRCode(document.getElementById("qrcode"), {
            text: qrData,
            width: 150,
            height: 150
        });

        // SHOW MODAL
        $('#qrModal').css('display', 'flex');
    });

    /**
     * Closes QR code modal when close button is clicked
     */
    $('#closeQr').on('click', function() {
        $('#qrModal').hide();
    });

    /**
     * Closes QR modal when clicking outside the modal content (overlay click)
     */
    $('#qrModal').on('click', function(e) {
        if (e.target.id === 'qrModal') {
            $('#qrModal').hide();
        }
    });

    // === MONITOR BOOKING CHANGES ===
    /**
     * Watches for booking deletions in other tabs/windows
     * If bookings array becomes smaller, reload the booking list
     * Ensures page stays in sync if user deletes booking elsewhere
     */
    window.addEventListener('storage', function(e) {
        if (e.key === 'bookings') {
            var updatedBookings = JSON.parse(e.newValue);
            if (updatedBookings.length < bookings.length) {
                // Booking was deleted, reload
                window.location.href = "../MY_BOOKINGS/booking.html";
            }
        }
    });
});

// Navigation function
function goBack() {
    window.location.href = "../MY_BOOKINGS/booking.html";
}

// LOGOUT USER
function logoutUser() {
    let confirmLogout = confirm("Are you sure you want to log out?");

    if (!confirmLogout) return;

    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loggedInUser"); 
    localStorage.removeItem("currentUserRole"); 

    window.location.href = "../AUTHENTICATION/login.html";
}