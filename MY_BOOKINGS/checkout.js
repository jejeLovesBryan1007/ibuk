// === AUTH GUARD ===
// FIX: redirect to login if user is not logged in
(function() {
    if (!localStorage.getItem("loggedInUser")) {
        window.location.href = "../AUTHENTICATION/login.html";
    }
})();

/**
 * Checkout initialization - loads booking summary and sets up event handlers
 * Displays the pending booking details from localStorage
 * Attaches cancel button functionality
 */
$(document).ready(function () {
  loadBookingSummary();

  // Cancel button on checkout card go back to event details
  $(".checkout-body .cancel").on("click", function () {
    if (confirm("Are you sure you want to cancel? Your seat selection will be lost.")) {
      localStorage.removeItem("pendingBooking");
      window.location.href = "../USER_DASHBOARD/user_dashboard.html";
    }
  });
});

/**
 * Reads pendingBooking from localStorage and populates both checkout card and success modal
 * Calculates total price and displays all booking details
 * Stores total in sessionStorage for use during payment processing
 */
function loadBookingSummary() {
  try {
    var data = localStorage.getItem("pendingBooking");

    if (data === null) {
      alert("No booking data found. Please select seats first.");
      return;
    }

    var booking = JSON.parse(data);

    var qty   = booking.seats.length;
    var price = booking.pricePerSeat;
    var total = price * qty;

    // Store total for use in processPayment
    sessionStorage.setItem("checkoutTotal", total);

    // Fill main Booking Summary card
    $(".checkout-body .name").text(booking.userName);
    $("#eventName").text("Event: " + booking.eventName);
    $("#eventDate").text("Date: " + booking.eventDate);
    $("#eventTime").text("Time: " + booking.eventTime);
    $("#eventVenue").text("Venue: " + booking.eventVenue);
    $("#bookedSeat").text("Booked Seat(s): " + booking.seats.join(", "));
    $("#eventPrice").text("Price: \u20b1" + price.toLocaleString() + " / seat");
    $("#quantity").text("Quantity: " + qty);
    $("#eventTotal").text("Total: \u20b1" + total.toLocaleString());

    // Fill Success Modal summary
    populateSuccessModal(booking, qty, price, total, "");

  } catch (err) {
    alert("Error loading booking summary: " + err.message);
  }
}

/**
 * Validates payment form fields
 * Checks: payment method selected, account number format (10-16 digits), account name provided
 * Returns true if all fields are valid, false otherwise
 */
function validatePaymentForm() {
  try {
    var method  = $("#paymentMethod").val();
    var accNum  = $("#accountNumber").val().trim();
    var accName = $("#accountName").val().trim();

    if (method === "selectMethod" || method === "") {
      alert("Please select a payment method.");
      $("#paymentMethod").focus();
      return false;
    }

    if (accNum === "" || accNum.length < 10 || accNum.length > 16) {
      alert("Please enter a valid account number (10 to 16 digits).");
      $("#accountNumber").focus();
      return false;
    }

    if (accName === "" || accName.length < 2) {
      alert("Please enter a valid account name.");
      $("#accountName").focus();
      return false;
    }

    return true;

  } catch (err) {
    alert("Validation error: " + err.message);
    return false;
  }
}

/**
 * Main payment processing function
 * Validates form, saves the booking, updates seat status, and displays success modal
 * Handles errors and shows appropriate alerts
 */
// FIX: accepts selectedMethod param so success modal shows the correct payment method
function processPayment(selectedMethod) {
  try {
    if (!validatePaymentForm()) return;

    var method  = $("#paymentMethod").val();
    var accNum  = $("#accountNumber").val().trim();
    var accName = $("#accountName").val().trim();
    var total   = Number(sessionStorage.getItem("checkoutTotal"));

    var paymentDetails = {
      method  : method,
      accNum  : accNum,
      accName : accName,
      total   : total
    };

    saveBooking(paymentDetails);
    updateSeatStatus();

    // FIX: update success modal with the actual selected payment method label
    var methodLabel = selectedMethod || $("#paymentMethod option:selected").text();
    $("#successModal .details p").last().text("Payment Method: " + methodLabel);

    // Hide payment modal, show success modal
    $("#paymentModal").hide();
    $("#successModal").fadeIn();

  } catch (err) {
    alert("Payment processing error: " + err.message);
  }
}

/**
 * Saves a confirmed booking to localStorage under "bookings" array and admin's "tblBookings" for transactions
 * Creates booking object with all payment and seat details
 * Also saves latest booking separately for ticket.js access
 * Clears the pending booking after successful save
 */
function saveBooking(paymentDetails) {
  try {
    var data = localStorage.getItem("pendingBooking");

    if (data === null) {
      alert("No pending booking to save.");
      return;
    }

    var pending = JSON.parse(data);

    var booking = {
      bookingId     : generateBookingId(),
      userName      : pending.userName,
      eventName     : pending.eventName,
      eventDate     : pending.eventDate,
      eventTime     : pending.eventTime,
      eventVenue    : pending.eventVenue, 
      seats         : pending.seats,
      pricePerSeat  : pending.pricePerSeat,
      quantity      : pending.seats.length,
      total         : paymentDetails.total,
      paymentMethod : paymentDetails.method,
      status        : "confirmed",
      bookedAt      : new Date().toLocaleString(),
      eventImage    : pending.eventImage || "party_bg.png"
    };

    // Get existing bookings array or start a new one
    var existing = localStorage.getItem("bookings");
    var bookings = (existing !== null) ? JSON.parse(existing) : [];

    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    // ALSO SAVE TRANSACTION TO tblBookings FOR ADMIN DASHBOARD
    saveTransactionForAdmin(booking);

    // Save the latest booking separately so ticket.js can read it
    localStorage.setItem("latestBooking", JSON.stringify(booking));

    // Clear the pending booking
    localStorage.removeItem("pendingBooking");

  } catch (err) {
    alert("Error saving booking: " + err.message);
  }
}

/**
 * Creates a transaction record for the admin dashboard
 * Stores booking information in the tblBookings array with proper formatting
 * Generates unique transaction ID and includes all seat and pricing data
 */
function saveTransactionForAdmin(booking) {
  try {
    var existingTransactions = localStorage.getItem("tblBookings");
    var transactions = (existingTransactions !== null) ? JSON.parse(existingTransactions) : [];

    // Get the next transaction ID
    var nextId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

    // Create transaction record with proper format for admin table
    var transaction = {
      id: nextId,
      eventName: booking.eventName,
      date: booking.eventDate,
      time: booking.eventTime,
      venue: booking.eventVenue,
      seat: booking.seats.join(", "), 
      price: booking.pricePerSeat,
      quantity: booking.quantity,
      total: booking.total
    };

    transactions.push(transaction);
    localStorage.setItem("tblBookings", JSON.stringify(transactions));

  } catch (err) {
    console.error("Error saving transaction for admin: " + err.message);
  }
}

/**
 * Marks booked seats in localStorage so the seat selection page can show them as unavailable
 * Prevents double-booking of the same seats
 * Retrieves existing booked seats and adds new ones
 */
function updateSeatStatus() {
  try {
    var data = localStorage.getItem("latestBooking");

    if (data === null) return;

    var booking = JSON.parse(data);

    var existing    = localStorage.getItem("bookedSeats");
    var bookedSeats = (existing !== null) ? JSON.parse(existing) : [];

    var index;
    for (index = 0; index < booking.seats.length; index++) {
      if (bookedSeats.indexOf(booking.seats[index]) === -1) {
        bookedSeats.push(booking.seats[index]);
      }
    }

    localStorage.setItem("bookedSeats", JSON.stringify(bookedSeats));

  } catch (err) {
    alert("Error updating seat status: " + err.message);
  }
}

/**
 * Redirects user to the ticket page to view their purchased ticket
 */
function redirectToTicket() {
  window.location.href = "../TICKETS/ticket.html"; // FIX: correct path from MY_BOOKINGS to TICKETS
}

/**
 * Generates a unique booking ID using timestamp and random characters
 * Format: EB-{timestamp}-{random}
 * Returns a unique identifier string for each booking
 */
function generateBookingId() {
  var ts   = Date.now().toString(36).toUpperCase();
  var rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return "EB-" + ts + "-" + rand;
}

/**
 * Pre-fills the success modal with booking details
 * Displays all transaction information (event, date, seats, prices) in the modal
 * Called after booking is created but before modal is shown
 */
// FIX: accepts paymentMethod param instead of hardcoding "GCash"
function populateSuccessModal(booking, qty, price, total, paymentMethod) {
  try {
    var modal = $("#successModal");

    modal.find(".name").text(booking.userName);

    var detailPs = modal.find(".details p");
    var fields = [
      "Event: "          + booking.eventName,
      "Date: "           + booking.eventDate,
      "Time: "           + booking.eventTime,
      "Venue: "          + booking.eventVenue,
      "Booked Seat(s): " + booking.seats.join(", "),
      "Price: \u20b1"    + price.toLocaleString() + " / seat",
      "Quantity: "       + qty,
      "Total: \u20b1"    + total.toLocaleString(),
      "Payment Method: " + (paymentMethod || "N/A")
    ];

    detailPs.each(function (index) {
      if (fields[index] !== undefined) {
        $(this).text(fields[index]);
      }
    });

  } catch (err) {
    console.log("Error populating success modal: " + err.message);
  }
}

/**
 * Opens the payment modal by showing it with fade-in animation
 * Prevents body scrolling while modal is open
 */
function openPayment() {
  $("#paymentModal").fadeIn();
  $("body").css("overflow", "hidden");
}

/**
 * Closes the payment modal and restores body scrolling
 */
// FIX: "Cancel Booking" in the payment modal now properly cancels —
// clears pendingBooking and redirects to dashboard instead of just hiding the modal
function closePayment() {
  if (confirm("Are you sure you want to cancel? Your seat selection will be lost.")) {
    $("#paymentModal").hide();
    $("body").css("overflow", "auto");
    localStorage.removeItem("pendingBooking");
    window.location.href = "../USER_DASHBOARD/user_dashboard.html";
  }
}

/**
 * Completes the payment process
 * Updates payment method in success modal and processes the payment
 */
function completePayment() {
  // FIX: get selected method once and pass it through to both processPayment and the modal
  var selectedMethod = $("#paymentMethod option:selected").text();
  processPayment(selectedMethod);
}

/**
 * Closes the success modal and restores body scrolling
 * Called when user clicks close button on success confirmation
 */
function closeSuccess() {
  $("#successModal").hide();
  $("body").css("overflow", "auto");
}

/**
 * Navigates to the ticket page from the success modal
 * Called when user clicks "View Ticket" button after successful payment
 */
function goToTicket() {
  redirectToTicket();
}