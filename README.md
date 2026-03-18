# 📅 EventBook

A web-based event booking system that allows customers to browse events, select seats, and complete payments — with a full admin dashboard for managing events and transactions.

> **ITEW 2 Midterm Project** — Group 1 | 2026

---

## 🚀 Features

### Customer
- Register and log in as a customer
- Browse available events on the dashboard
- Select seats interactively from a seat map
- Checkout with payment method selection (GCash, PayMaya, Bank Transfer)
- View booking history and ticket details with QR code
- Cancel, restore, or delete bookings
- Reset forgotten password

### Admin
- Log in as an admin
- Register, edit, and delete events
- View all transactions
- Dashboard with live stats: total events, bookings, revenue, occupancy rate

---

## 🗂️ Project Structure

```
ITEW_2_MIDTERM_PROJECT_Fixed/
│
├── index.html                  # Landing / home page
├── index.js
│
├── AUTHENTICATION/
│   ├── login.html              # Login page
│   ├── login.js
│   ├── signup.html             # Registration page
│   ├── signup.js
│   ├── forgot-password.html    # 3-step password reset
│   ├── forgot-password.js
│   └── authentication.css
│
├── ADMIN_DASHBOARD/
│   ├── admin_dashboard.html    # Admin panel (events + transactions)
│   ├── admin_dashboard.js
│   └── admin_dashboard.css
│
├── USER_DASHBOARD/
│   ├── user_dashboard.html     # Customer event listing
│   ├── user_dashboard.js
│   └── user_dashboard.css
│
├── EVENT_DETAILS/
│   ├── event_details.html      # Event info + seat map
│   ├── event_details.js
│   └── event_details.css
│
├── MY_BOOKINGS/
│   ├── booking.html            # Booking history
│   ├── booking.js
│   ├── booking.css
│   ├── checkout.html           # Checkout + payment modal
│   ├── checkout.js
│   └── checkoutstyle.css
│
├── TICKETS/
│   ├── ticket.html             # Ticket viewer with QR code
│   ├── ticket.js
│   └── ticketstyle.css
│
└── IMAGES/
    └── (logo, backgrounds, icons)
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and layout |
| JavaScript (Vanilla) | Logic and interactivity |
| jQuery 3.7.1 | DOM manipulation |
| localStorage | Data persistence (users, events, bookings) |
| QRCode.js | QR code generation for tickets |

> No backend or database — all data is stored in the browser's `localStorage`.

---

## 🔐 Default Accounts

| Role | Email | Password |
|---|---|---|
| Customer | user@example.com | 12345678 |
| Admin | admin@example.com | admin123 |

You can also register a new customer account via the Sign Up page.

---

## ▶️ How to Run

No installation or server required.

1. Download or clone the repository
2. Open `index.html` in any modern browser (Chrome recommended)
3. That's it — no build step needed

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
# Open index.html in your browser
```

---

## 🧭 Getting Started — Step by Step

### 👤 Accessing the Customer Dashboard

> **Important:** You must sign up first before you can log in as a customer.

1. Open `index.html` and click **Sign Up**
2. Fill in the registration form using these credentials:
   - **Full Name:** `User Example` *(or any first and last name)*
   - **Email:** `user@example.com`
   - **Password:** `12345678`
   - **Confirm Password:** `12345678`
3. Click **Register** — you will be redirected to the login page
4. On the login page, enter:
   - **Email:** `user@example.com`
   - **Password:** `12345678`
   - **Account Type:** `Customer`
5. Click **Log In** — you will be taken to the **Customer Dashboard**

---

### 🔑 Accessing the Admin Dashboard

> The admin account is built-in and does **not** require sign up — just log in directly.

1. Open `index.html` and click **Sign In**
2. On the login page, enter:
   - **Email:** `admin@example.com`
   - **Password:** `admin123`
   - **Account Type:** `Admin`
3. Click **Log In** — you will be taken to the **Admin Dashboard**

---

## 📋 Pages & Flow

```
Home (index.html)
├── Sign Up → signup.html → login.html
├── Sign In → login.html
│   ├── Admin → admin_dashboard.html
│   └── Customer → user_dashboard.html
│       └── View Details → event_details.html
│           └── Proceed to Checkout → checkout.html
│               └── View Ticket → ticket.html
│
└── My Bookings → booking.html
    └── View Ticket → ticket.html
```

---

## 👥 Group Members

| Name | Role |
|---|---|
| Balbero, Lee Raffy Angelo O.  | Back-end and GitHub Repository Maintainer |
| Balean, Pauleen C.            | Front-end and Demonstrator                |
| Baltazar, Ralph Christian J.  | Back-end and Video Editor                 |
| Batacan, Elaine Grace S.      | Back-end                                  |
| Bautista, Lawrence Jr. C.     | Leader, Front-end, and Documentation      |
| Beato, Jerome Ivan P.         | Front-end                                 |
| Buquid, Abraham Kristoffer M. | Back-end and Demonstrator                 |
| Capoy, Andrei C.              | Back-end and GitHub Repository Maintainer |
| Cosino, Mikaela Princess I.   | Front-end and Back-end Checker            |
| Salvador, Jerick S.           | Front-end and Back-end Checker            |

---

## 📝 Notes

- All data resets when browser localStorage is cleared
- The seat map uses real booked seat data — seats booked by any user are marked unavailable for others
- The admin dashboard must be visited at least once (or a user must log in first) to initialize default event data

---

*Copyright © 2026 Group 1*
