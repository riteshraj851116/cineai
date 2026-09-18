# CINEAI — AI-Powered Production Movie Ticket Booking Platform

![CineAI Banner](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80)

CineAI is an enterprise-grade, full-stack **MERN** cinema discovery and real-time ticket booking ecosystem. Engineered with **Socket.IO** for instantaneous seat reservation synchronization, **GSAP & Three.js** for cinematic aesthetics, and a suite of **AI-driven intelligence modules** (Natural Language Concierge, Intelligent Seat Optimization, Sentiment Review Summarization, and Safe Admin Business Aggregations).

---

## 🌟 Key Highlights & Features

### 1. 🎬 Cinematic UI & Immersive Aesthetics
- **Dark Cinematic Visual Language**: Obsidian surfaces (`#06090E`), cyan laser accents (`#00F0FF`), and warm gold glows (`#F59E0B`).
- **Three.js Projector Beam**: Lightweight ambient dust particles reflecting projector light, with automatic WebGL detection and pure CSS graceful fallback for low-power or reduced-motion environments.
- **GSAP Dynamic Animations**: Smooth hero transitions, movie card reveals, interactive seat pulses, and digital ticket unfolding.
- **Responsive Architecture**: Fully responsive across mobile (320px–430px), tablet (768px), and 4K desktop displays.

### 2. ⚡ Real-Time Socket.IO Seat Booking
- **Sub-second Concurrency**: Live seat locking prevents double-booking and race conditions across multiple browser sessions.
- **Configurable TTL Auto-Release**: Temporary 7-minute reservation timer with live countdown ticker. Seats auto-release if abandoned.
- **Server-Side Validation**: Never trusts frontend availability; verifies seat occupied states atomically on the backend.
- **Realistic Matrix Seating**: Regular, Premium, Recliner, and VIP tiers with visual curved screen geometry.

### 3. 🤖 AI Intelligence Suite
- **CineAI Floating Assistant**: Persistent conversational AI concierge capable of understanding intents (`SEARCH_MOVIES`, `FIND_SHOWS`, `FIND_SEATS`, `RECOMMEND_MOVIES`, `CHECK_BOOKING`, `CANCEL_BOOKING`, `FIND_OFFERS`).
- **Confirmation Safety Protocol**: Sensitive actions (cancellations/payments) require explicit user confirmation before executing.
- **Natural Language Movie Search**: Interprets natural queries like *"Hindi action movies in IMAX under 2.5 hours"* into active filter tokens.
- **AI Review Summarizer**: Multi-dimensional aspect scoring (Story, Acting, Direction, Music, Visuals, Pacing) with sentiment classification and consensus highlights.
- **AI Smart Seat Recommender**: Optimizes viewing angle, audio sweet spot, party size (1–4), and distance preferences.
- **AI Admin Business Analytics**: Natural language business queries safely executed against predefined MongoDB aggregation pipelines.

### 4. 🎟️ Digital QR Tickets & Concessions
- **Cryptographic QR Code**: Generates a verifiable high-resolution QR pass encoding reference, venue, showtime, and security hash.
- **Concessions & Combos**: Add gourmet butter popcorn, loaded nachos, and chilled drinks directly into the booking order.
- **Coupon Validation**: Server-side discount enforcement with rules (`WELCOME10`, `MOVIENIGHT`, `CINEAI20`).
- **Seamless Payments**: Full order lifecycle with Razorpay/Stripe test integration and 1-click test verification.
- **Hassle-Free Cancellation & Refunds**: Automatic seat release, wallet refund crediting, and CinePoints adjustments.

### 5. 👑 Multi-Role Portals & Dashboards
- **Admin Dashboard (`/admin`)**: Real MongoDB aggregation metrics (GMV revenue, occupancy rate, tickets sold, format breakdowns) and Recharts visual trends.
- **Theatre Owner Dashboard (`/theatre-owner`)**: Scoped to the partner multiplex; screen configurations, show scheduling, and pricing matrix.
- **CinePoints Loyalty Program (`/rewards`)**: 10% points back on every booking, 25 points per verified review, redeemable for vouchers and concession upgrades.

---

## 🏗️ Architecture & Tech Stack

```
cineai/
├── server/               # Node.js & Express.js Backend
│   ├── config/           # Database connection & system constants
│   ├── controllers/      # 15+ Controllers handling business logic
│   ├── middleware/       # JWT Auth, Role authorization, Global error handler
│   ├── models/           # 12 Mongoose models (User, Movie, Show, Seat, Booking...)
│   ├── routes/           # REST API Route declarations
│   ├── seeds/            # Realistic data seeder for movies, theatres, and shows
│   ├── services/         # SocketService, SeatLockService, AIService, PaymentService
│   ├── server.js         # Entrypoint with HTTP & Socket.IO server
│   └── package.json
│
└── client/               # React 18 + Vite Frontend
    ├── src/
    │   ├── components/   # Modular UI, Cinematic Hero, Seat Map, AI Assistant
    │   ├── context/      # Auth, City, Socket, Notification Contexts
    │   ├── pages/        # Home, Movies, Details, Booking, Ticket, Dashboards
    │   ├── services/     # Axios client with JWT interceptor, Socket singleton
    │   ├── styles/       # Modular CSS design system
    │   ├── App.jsx       # Routing and layout
    │   └── main.jsx
    └── vite.config.js
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Clone & Setup Server
```bash
cd cineai/server
npm install
npm run seed     # Seeds realistic movies, multiplexes, shows, and demo users
npm start        # Launches backend on http://localhost:5000
```

### 2. Setup Client
```bash
cd cineai/client
npm install
npm run dev      # Launches frontend on http://localhost:5173
```

---

## 👥 Demo Credentials (1-Click Login Ready)

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cineai.com` | `Admin@123` | Full access to `/admin`, platform metrics & AI analytics |
| **Theatre Owner** | `owner@cineai.com` | `Owner@123` | Access to `/theatre-owner`, multiplex shows & pricing |
| **Moviegoer** | `user@cineai.com` | `User@123` | Bookings, QR tickets, loyalty rewards & reviews |

---

## 📡 Core API Endpoints

- **Authentication**: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- **Movies**: `GET /api/movies`, `GET /api/movies/:id`, `GET /api/movies/slug/:slug`
- **Shows & Seats**: `GET /api/shows`, `GET /api/seats/show/:showId`
- **Bookings**: `POST /api/bookings/intent`, `POST /api/bookings/confirm`, `POST /api/bookings/:id/cancel`
- **AI Intelligence**: `POST /api/ai/chat`, `POST /api/ai/search`, `GET /api/ai/review-summary/:movieId`, `POST /api/ai/recommend-seats`
- **Admin**: `GET /api/admin/stats`, `GET /api/admin/charts`, `POST /api/admin/ai-analytics`

---

## 🔒 Security Implementations
- **Bcrypt**: 10-round password salt hashing
- **JWT**: Stateless token authorization with bearer interceptors
- **Server Verification**: Rigorous payment signature validation and atomic lock checking
- **Safe Analytics**: Controlled aggregation execution preventing arbitrary database injection
