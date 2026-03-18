// === AUTH GUARD ===
// FIX: redirect to login if user is not logged in
(function() {
    if (!localStorage.getItem("loggedInUser")) {
        window.location.href = "../AUTHENTICATION/login.html";
    }
})();

/**
 * BookingManager Class - Manages user booking display and operations
 * Handles loading, displaying, canceling, restoring, and deleting bookings
 * Updates admin transaction list when bookings are modified
 */
class BookingManager {
    constructor() {
        this.init();
    }

    /**
     * Initializes the booking manager when document is ready
     * Loads user bookings and sets up event listeners for user interactions
     */
    init() {
        $(document).ready(() => {
            this.loadUserBookings();
            this.setupEventListeners();
        });
    }

    /**
     * Loads all bookings from localStorage and displays them on the page
     * Retrieves the bookings array from localStorage
     */
    loadUserBookings() {
        let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
        this.displayBookings(bookings);
    }

    /**
     * Renders booking cards with all booking information, status, and action buttons
     * Shows confirmed bookings with cancel button, cancelled bookings with restore/delete buttons
     * Displays seat information in a grid format
     */
    displayBookings(bookings) {
        const $wrapper = $('.bookings-wrapper');
        $wrapper.empty();

        if (bookings.length === 0) {
            $wrapper.html("<p>No bookings found.</p>");
            return;
        }

        bookings.forEach(booking => {

            const isCancelled = booking.status === "Cancelled";
            const statusClass = isCancelled ? 'cancelled' : 'active';

            const actionButton = isCancelled
                ? `<button class="btn btn-restore">Restore Booking</button>`
                : `<button class="btn btn-cancel">Cancel Booking</button>`;

            // DELETE BUTTON - ONLY VISIBLE FOR CANCELLED BOOKINGS
            const deleteButton = isCancelled
                ? `<button class="btn btn-delete">Delete</button>`
                : '';

            // SEATS DISPLAY
            let seatGridHtml = '';

            booking.seats.forEach(seat => {
                seatGridHtml += `<div class="seat reserved">${seat}</div>`;
            });

            const cardHtml = `
                <div class="booking-card" data-id="${booking.bookingId}">
                    <div class="card-header">
                        <h3>Booking ID: #${booking.bookingId}</h3>
                        <div class="header-actions">
                            <span class="status-badge ${statusClass}">
                                ${booking.status}
                            </span>
                            ${deleteButton}
                        </div>
                    </div>

                    <div class="card-body">
                        <div class="event-details">
                            <p><strong>Event:</strong> ${booking.eventName}</p>
                            <p><strong>Venue:</strong> ${booking.eventVenue}</p>
                            <p><strong>Date:</strong> ${booking.eventDate}</p>

                            <div class="button-group">
                                <button class="btn btn-view">View Ticket</button>
                                ${actionButton}
                            </div>
                        </div>

                        <div class="seat-grid">
                            ${seatGridHtml}
                        </div>
                    </div>
                </div>
            `;

            $wrapper.append(cardHtml);
        });
    }

    /**
     * Navigates to the ticket page for a specific booking
     * Stores the selected booking ID in localStorage for the ticket page to retrieve
     */
    showTicketSummary(bookingId) {
        localStorage.setItem("selectedBooking", bookingId);
        window.location.href = "../TICKETS/ticket.html";
    }

    /**
     * Updates a booking's status (cancelled or restored)
     * Modifies the booking object and saves changes to localStorage
     * If restoring a booking, also restores the transaction to admin's transaction list
     */
    updateBookingStatus(bookingId, newStatus) {
        let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
        
        // Find the booking being updated
        let updatedBooking = null;

        bookings = bookings.map(book => {
            if (book.bookingId == bookingId) {
                book.status = newStatus;
                updatedBooking = book;
            }
            return book;
        });

        localStorage.setItem("bookings", JSON.stringify(bookings));

        // If restoring a booking, restore the transaction to admin list
        if (newStatus === "Confirmed" && updatedBooking) {
            this.restoreAdminTransaction(updatedBooking);
        }

        alert(newStatus === "Cancelled" ? "Booking cancelled!" : "Booking restored!");

        this.loadUserBookings();
    }

    /**
     * Permanently deletes a cancelled booking after user confirmation
     * Only allows deletion of cancelled bookings, not active ones
     * Removes booking from user's bookings list and admin's transaction list
     */
    deleteBooking(bookingId) {
        let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
        
        // Find the booking to be deleted
        const bookingToDelete = bookings.find(b => b.bookingId == bookingId);
        
        if (!bookingToDelete) {
            alert("Booking not found.");
            return;
        }

        // Prevent deletion of active bookings
        if (bookingToDelete.status !== "Cancelled") {
            alert("You can only delete cancelled bookings. Please cancel the booking first.");
            return;
        }

        if (!confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) {
            return;
        }

        // Remove from user bookings
        bookings = bookings.filter(b => b.bookingId != bookingId);
        localStorage.setItem("bookings", JSON.stringify(bookings));

        // Remove from admin transactions (tblBookings)
        this.removeFromAdminTransactions(bookingToDelete);

        alert("Booking permanently deleted!");
        this.loadUserBookings();
    }

    /**
     * Removes a cancelled booking's transaction from the admin's transaction list
     * Searches for transactions matching the booking's event and seats
     */
    removeFromAdminTransactions(booking) {
        let transactions = JSON.parse(localStorage.getItem("tblBookings")) || [];
        
        // Find and remove transaction matching this booking's event and seats
        transactions = transactions.filter(t => {
            // Match by event name and seat(s) to ensure we remove the correct transaction
            const bookingSeats = booking.seats.join(", ");
            return !(t.eventName === booking.eventName && t.seat === bookingSeats);
        });

        localStorage.setItem("tblBookings", JSON.stringify(transactions));
    }

    /**
     * Restores a booking's transaction to the admin's transaction list when booking is restored
     * Prevents duplicate transactions by checking if transaction already exists
     * Creates a new transaction record with booking details
     */
    restoreAdminTransaction(booking) {
        let transactions = JSON.parse(localStorage.getItem("tblBookings")) || [];
        
        // Check if transaction already exists
        const bookingSeats = booking.seats.join(", ");
        const transactionExists = transactions.some(t => 
            t.eventName === booking.eventName && t.seat === bookingSeats
        );

        // Only add if it doesn't already exist
        if (!transactionExists) {
            // Get the next transaction ID
            const nextId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

            // Create transaction record with proper format for admin table
            const transaction = {
                id: nextId,
                eventName: booking.eventName,
                date: booking.eventDate,
                time: booking.eventTime,
                venue: booking.eventVenue,
                seat: bookingSeats,
                price: booking.pricePerSeat,
                quantity: booking.quantity,
                total: booking.total
            };

            transactions.push(transaction);
            localStorage.setItem("tblBookings", JSON.stringify(transactions));
        }
    }

    /**
     * Attaches click event handlers to booking action buttons
     * Delegates events for view, cancel, restore, and delete buttons
     */
    setupEventListeners() {
        const $wrapper = $('.bookings-wrapper');

        // VIEW
        $wrapper.on('click', '.btn-view', (e) => {
            const id = $(e.currentTarget).closest('.booking-card').data('id');
            this.showTicketSummary(id);
        });

        // CANCEL
        $wrapper.on('click', '.btn-cancel', (e) => {
            const id = $(e.currentTarget).closest('.booking-card').data('id');

            if (confirm("Cancel this booking?")) {
                this.updateBookingStatus(id, "Cancelled");
            }
        });

        // RESTORE
        $wrapper.on('click', '.btn-restore', (e) => {
            const id = $(e.currentTarget).closest('.booking-card').data('id');

            if (confirm("Restore this booking?")) {
                this.updateBookingStatus(id, "Confirmed");
            }
        });

        // DELETE
        $wrapper.on('click', '.btn-delete', (e) => {
            const id = $(e.currentTarget).closest('.booking-card').data('id');
            this.deleteBooking(id);
        });
    }
}

// === INITIALIZE BOOKING MANAGER ===
const app = new BookingManager();

/**
 * Logs out the current user after confirmation
 * Clears all user session data from localStorage and redirects to login page
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