# EduTrade | Campus Components Marketplace

**EduTrade** (Campus Components Marketplace) is a premium peer-to-peer full-stack e-commerce website designed specifically for college students. It allows seniors to trade, sell, or donate their unused electronic elements, drone accessories, motors, tools, and custom robotics kits directly to junior engineering students inside the campus.

This repository is built using the **MERN** stack (MongoDB, Express, React, Node.js) styled with **Tailwind CSS**, featuring real-time private socket.io messaging, an AI content-similarity product recommendation system, QR code contact card generators, and complete role-based moderations.

---

## 💡 Seamless Zero-Configuration Local Fallback (Developer Experience)
To get beginners up and running **instantly** without having to pre-register MongoDB Atlas or Cloudinary accounts, this project includes a graceful **Zero-Configuration Fallback Layer**:
- **Database Fallback:** If `MONGO_URI` is omitted inside `.env`, the server automatically initializes a local JSON file storage (`local_db.json`) and emulates standard Mongoose active-record methods.
- **Image Fallback:** If Cloudinary credentials are empty, the backend uploads images directly to the local disk system (`public/uploads`) and serves them statically.

*Thus, you can clone, install dependencies, seed dummy data, and run the complete real-time application immediately without configuring any third-party credentials!*

---

## 📁 Repository Structure
```
campus-components-marketplace/
├── package.json                 # Monorepo concurrent runner
├── README.md                    # Setup instructions
├── DEPLOYMENT.md                # Vercel & Render hosting guide
├── backend/                     # Express.js backend server
│   ├── config/                  # DB and Cloudinary connection drivers
│   ├── controllers/             # Auth, Listings, Chat and Admin API controllers
│   ├── middleware/              # JWT protection filters and Multer uploader
│   ├── models/                  # Wrapped DB schemas (User, Product, Message, Review)
│   ├── routes/                  # API routers
│   ├── scripts/                 # Dummy data database seed script
│   └── server.js                # Core startup server & WebSocket hub
└── frontend/                    # Vite + React + Tailwind frontend
    ├── tailwind.config.js       # Tailwind CSS design system
    ├── postcss.config.js        
    ├── index.html               # Main page layout with SEO tags
    └── src/
        ├── App.jsx              # Navigation routes & Context wrappers
        ├── index.css            # Custom glassmorphism, glowing utilities, scrollbars
        ├── context/             # ThemeContext (Dark/Light) & AuthContext
        ├── components/          # Theme toggler, ProductCard, Navbar, QR contact drawer
        └── pages/               # Home, Listings, Details, Dashboard, Inbox Chat, Admin panel
```

---

## 🛠️ Step-by-Step Local Deployment Guide

Follow these sequential instructions to install, seed, and launch the platform on your machine:

### 1. Prerequisite Installations
- Ensure you have [Node.js](https://nodejs.org/) installed (v18.x or v20.x recommended).
- Ensure Git is configured on your system.

### 2. Install Project Dependencies
Open your command terminal (PowerShell, bash, or CMD) inside the root `campus-components-marketplace` folder, and execute:
```bash
# Installs monorepo concurrently packages
npm install

# Installs Express, Mongoose, Socket.io on the backend
npm run install-backend

# Installs React, React Router, Lucide, Tailwind on the frontend
npm run install-frontend
```

### 3. Populate Sample Dummy Data (Seeding)
To populate your database (`local_db.json` by default, or MongoDB if configured) with 10 electronics hardware listings, complete project kits, active messages, and student seller ratings:
```bash
cd backend
npm run seed
cd ..
```

### 4. Boot Up the Application
From the root monorepo directory, start both the Express backend and React Vite client concurrently with a single command:
```bash
npm run dev
```
- Your **Express API Server** is now running on: [http://localhost:5000](http://localhost:5000)
- Your **React Frontend Client** is now running on: [http://localhost:5173](http://localhost:5173) (Open this in your browser!)

---

## 🧑‍💻 Quick Local Testing Credentials
When testing locally, you can authenticate immediately using these pre-seeded student accounts (Password: `student123`):
* **Administrator Account:** `admin@college.edu` (Full moderation panel to flag spam)
* **Student Seller:** `alex@college.edu`
* **Robotics Student:** `rohan@college.ac.in`

---

## 🛡️ Key Marketplace Features
1. **P2P Socket Chat:** Real-time communications between buyer and seller. Access it by opening two distinct browser tabs (one in incognito mode) and messaging one another!
2. **AI Recommendation System:** Analyzes category overlap, hardware conditions, and price structures on every product details page to suggest alternatives.
3. **College Domain Guards:** Restricts registration to verified student email domains (`.edu`, `.ac.*`, `.org`).
4. **WhatsApp QR Connect:** Generates customized SVGs to instantly open conversations on whatsapp/telegram for quick off-app trades.
