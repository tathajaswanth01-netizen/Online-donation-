# GiveCare — Online Donation Platform

> **"Give What You Don't Need. Help Someone Who Does."**

A centralized, production-quality web application built exclusively with the **MERN** stack (MongoDB, Express.js, React.js, Node.js). The platform connects donors and receivers to facilitate the reuse of clothes, books and educational materials, food and groceries, electronic devices, furniture, medical supplies, household items, toys, and other essential goods.

Designed with a warm, trustworthy, community-oriented visual identity (#285943 deep forest green, #F7F5EF warm cream, #D99155 muted amber) and engineered to prevent commercial exploitation and resource misuse.

---

## 🚀 Key Features

### 1. User Roles & Identity Verification
- **Roles**: Donor, Receiver, Both (Dual-role), and Administrator.
- **Identity Verification System**: Users upload government or institutional ID documents to earn a verified identity badge (🛡️ Verified).
- **Anti-Misuse Architecture**: Receiver request reasoning, anti-resale declaration pledges, public location privacy safeguards, and one-click misuse reporting.

### 2. Full Donation Management
- **Free & Paid Resource Transfers**:
  - **Free Donations**: 100% zero-cost community resource sharing.
  - **Paid Donations**: Subsidized, nominal compensation for high-value second-hand items (e.g. laptops, monitors, wheelchairs) with no hidden fees.
- **Rich Multi-Image Listings**: Multiple photos with gallery navigation, item conditions (`New`, `Like New`, `Good`, `Usable`), quantity tracking, location (city, state, PIN), and pickup instructions.
- **Donation Lifecycles**: `Available` ➔ `Request Received` ➔ `Reserved` ➔ `Ready for Pickup` ➔ `Handed Over` ➔ `Completed`.

### 3. Dynamic Browse & Live Search
- **Live Debounced Search**: Search by item title, description, city, or PIN code.
- **Multi-parameter Filtering**: Filter by category, donation type (Free/Paid), condition, price range, and city.
- **Sorting & Pagination**: Newest, Oldest, Price Low-to-High, Price High-to-Low, Most Viewed.

### 4. Interactive Request & Handover Tracking
- Receivers submit requests stating genuine need, intended use, preferred pickup method, and contact preference.
- Donors review receiver profiles, verified identity badges, and accept or decline requests with explanatory notes.
- Step-by-step handover progression: Donor marks **"Ready for Pickup"** ➔ **"Handed Over"** ➔ Receiver clicks **"Confirm Receipt"**.

### 5. In-Platform Coordination Chat & Real-Time Notifications
- Secure internal messaging drawer between donor and receiver tied to each accepted request.
- Socket.io live socket notifications and unread bell badge with one-click "Mark all read".

### 6. Saved Donations / Wishlist
- Add or remove items to wishlist with dynamic indicator of live item availability.

### 7. Administrator Panel
- **Analytics & Visualizations**: Interactive Recharts graphs showing donations by category, Free vs Paid split, and donation lifecycles.
- **Moderation Tools**: Review pending identity verification applications, suspend or reactivate accounts, remove reported/flagged listings, and resolve user inquiries.
- **Category Management**: Create, edit, and deactivate resource categories.

---

## 🛠️ Technology Stack (Strictly MERN)

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 18, React Router DOM v6, Tailwind CSS, Lucide React, Recharts, React Hot Toast, Axios, Context API, Socket.io-client |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, Multer, Socket.io, Morgan, CORS, Dotenv |
| **Database** | MongoDB, Mongoose ODM |

---

## 👥 Demo Accounts (Ready to Test)

The database includes pre-configured, realistic test accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@platform.org` | `Admin@123` | Full access to Admin Panel, moderation, analytics, verification approval |
| **Verified Donor 1** | `sarah.donor@example.com` | `Donor@123` | Active donor with listings in Delhi (Textbooks, Winter jackets, Groceries) |
| **Verified Donor 2** | `rahul.donor@example.com` | `Donor@123` | Active donor with listings in Bengaluru (Laptop, Monitor, Stroller) |
| **Verified Receiver** | `arjun.receiver@example.com` | `Receiver@123` | Student receiver in Pune with active requests and wishlist items |
| **Pending Receiver** | `priya.receiver@example.com` | `Receiver@123` | Community shelter volunteer in Chennai with pending verification |
| **Dual Role (Both)** | `david.both@example.com` | `Both@123` | Both donor & receiver in Hyderabad (Wheelchair, Study table, Cookware) |

*Tip: The Login page includes 1-click quick-fill buttons for Administrator, Donor, and Receiver!*

---

## 🏁 Quickstart Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Clone & Setup Backend
```bash
cd server
npm install
# Configure .env (defaults to port 5050 and local MongoDB)
npm run seed     # Seeds realistic categories, users, items, and requests
npm start        # Starts Express server on port 5050
```

### 2. Setup Frontend
```bash
cd ../client
npm install
npm run dev      # Starts Vite React dev server on http://localhost:5176
```

Open `http://localhost:5176` (or the port Vite prints in your console) in your browser.

### 3. Run Automated End-to-End Test Suite
```bash
cd server
npm test
```
Executes 14 comprehensive tests verifying login, listing creation, wishlist, requesting, donor approval, messaging, handover, receipt confirmation, reporting, admin stats, and contact submissions against live MongoDB records.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user (multipart supported for profile photo).
- `POST /api/auth/login` — Login with email and password, returns JWT token.
- `GET  /api/auth/me` — Get current logged-in user profile.
- `PUT  /api/auth/profile` — Update name, phone, bio, address, role.
- `PUT  /api/auth/change-password` — Change password.
- `POST /api/auth/forgot-password` — Generate password reset token.
- `POST /api/auth/reset-password` — Reset password using token.
- `PUT  /api/auth/deactivate` — Deactivate user account.

### Users & Verification (`/api/users`)
- `GET  /api/users/profile/:id` — Public sanitized profile and completed donation counts.
- `POST /api/users/verify` — Submit verification document and ID number.
- `GET  /api/users/verification-status` — Get status and review notes.

### Categories (`/api/categories`)
- `GET  /api/categories` — List all active categories with available item counts.
- `POST /api/categories` — Admin create category.
- `PUT  /api/categories/:id` — Admin update category.
- `DELETE /api/categories/:id` — Admin deactivate category.

### Donations (`/api/donations`)
- `GET   /api/donations` — Browse listings with live search, category, condition, type, city, price range, and sorting.
- `GET   /api/donations/home-data` — Homepage curated sections and live community impact metrics.
- `GET   /api/donations/my-donations` — Donor's listings.
- `GET   /api/donations/:id` — Single listing details and similar category recommendations.
- `POST  /api/donations` — Create new donation listing.
- `PUT   /api/donations/:id` — Update listing details.
- `DELETE /api/donations/:id` — Delete listing (prevented if active accepted requests exist).
- `PATCH /api/donations/:id/availability` — Toggle Available / Unavailable.

### Donation Requests (`/api/requests`)
- `POST /api/requests` — Submit request for an available item.
- `GET  /api/requests/my-requests` — Receiver's submitted requests.
- `GET  /api/requests/incoming` — Donor's incoming requests.
- `GET  /api/requests/:id` — Request details and conversation context.
- `PUT  /api/requests/:id/status` — Accept, Reject, Mark Ready for Pickup, Hand Over, Complete.
- `PUT  /api/requests/:id/cancel` — Cancel pending request (restores quantity).
- `PUT  /api/requests/:id/confirm-receipt` — Receiver confirms receipt of item.

### Messaging (`/api/messages`)
- `POST /api/messages` — Send message within accepted request.
- `GET  /api/messages/request/:requestId` — Get conversation history.

### Wishlist (`/api/wishlist`)
- `GET  /api/wishlist` — Get user's saved donations.
- `POST /api/wishlist/toggle` — Add / remove donation from wishlist.

### Notifications (`/api/notifications`)
- `GET  /api/notifications` — List notifications and unread counter.
- `PUT  /api/notifications/:id/read` — Mark notification as read.
- `PUT  /api/notifications/read-all` — Mark all as read.

### Misuse Reports (`/api/reports`)
- `POST /api/reports` — Submit report regarding suspected resale or false condition.
- `GET  /api/reports/my-reports` — User's submitted reports.
- `GET  /api/reports/admin` — Admin report moderation queue.
- `PUT  /api/reports/admin/:id` — Resolve report and apply moderation action.

### Administrator Control (`/api/admin`)
- `GET /api/admin/stats` — Overall statistics and chart breakdowns.
- `GET /api/admin/users` — Search and filter users by role and verification status.
- `PUT /api/admin/users/:id/verification` — Approve or reject user verification documents.
- `PUT /api/admin/users/:id/status` — Suspend or reactivate user accounts.
- `GET /api/admin/donations` — Moderation view of all listings.
- `GET /api/admin/requests` — Global transaction and request log.

### Contact & Support (`/api/contact`)
- `POST /api/contact` — Public inquiry submission.
- `GET  /api/contact/admin` — Admin view of support messages.
- `PUT  /api/contact/admin/:id` — Update message status and add administrative reply.

---

## 🔒 Security & Quality Standards
- **Zero Mock Static Data in Production**: All categories, listings, requests, messages, and metrics originate from MongoDB.
- **Password Protection**: Passwords hashed with `bcryptjs` (salt factor 10) and omitted from API query results (`select: false`).
- **Authorization Enforcement**: Route-level ownership checks preventing unauthorized editing/deletion of other users' listings or requests.
- **Cross-Request Safety**: Deducts quantities atomically upon request acceptance; restores quantities on cancellation; prevents double booking.
- **File Validation**: Image file extension and MIME checks with 5MB limits.
- **Sanitized Client UI**: Toast alerts for all operations, responsive mobile navigation, debounce search, and empty states.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
