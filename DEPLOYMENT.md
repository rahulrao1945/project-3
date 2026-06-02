# 🚀 Full-Stack Deployment Guide (Vercel + Render)

This manual guides you through deploying the **Campus Components Marketplace** to production. We will host the **Express + Node.js + WebSocket Server** on **Render**, and the **Vite + React Frontend** on **Vercel**, backed by a live **MongoDB Atlas** database.

---

## 💾 Phase 1: Deploying MongoDB Atlas (Database)
Render doesn't provide persistent storage, so you **must** set up a free MongoDB database:
1. Register/Login to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new shared **M0 Free Cluster**.
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere, required for Render dynamically changing server IPs).
4. Under **Database Access**, create a user account and save the password.
5. In your cluster dashboard, click **Connect** -> **Drivers** and copy your **connection string**:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/campus_marketplace?retryWrites=true&w=majority
   ```
   *(Keep this string secure!)*

---

## ⚡ Phase 2: Deploying the Backend on Render
Render is a cloud hosting provider perfect for Express servers and WebSockets:
1. Create a free account at [Render](https://render.com/).
2. Push your project code to a public or private **GitHub** repository.
3. In the Render Dashboard, click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the Web Service:
   - **Name:** `campus-components-backend`
   - **Environment:** `Node`
   - **Region:** Choose the region closest to you.
   - **Branch:** `main` (or your active branch)
   - **Root Directory:** `backend` (CRITICAL!)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Click **Advanced** and add these **Environment Variables**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(A custom strong random string)*
   - `MONGO_URI`: *(Your MongoDB connection string copied from Atlas)*
   - *Optional:* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
7. Click **Create Web Service**. Render will build and deploy. Keep note of your backend URL (e.g. `https://campus-components-backend.onrender.com`).

---

## 🎨 Phase 3: Deploying the Frontend on Vercel
Vercel is the premier platform for static frontend builds like React + Vite:
1. Create a free account at [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** and import your GitHub repository.
3. Configure the Project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend` (CRITICAL!)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables** and add the backend connection variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-app.onrender.com/api` (Verify this matches your Render URL!)
5. Click **Deploy**. Vercel will install dependencies, build the assets, and publish your site with a custom domain (e.g., `https://campus-components.vercel.app`).

---

## 🔗 Phase 4: Enabling WebSockets on Client
Because Vite compiles statically, the frontend Chat page initializes `io('http://localhost:5000')` for local development. When deploying:
1. Open [AuthContext.jsx](file:///c:/Users/raora/OneDrive/Desktop/projects/project%203/frontend/src/context/AuthContext.jsx) and [ChatPage.jsx](file:///c:/Users/raora/OneDrive/Desktop/projects/project%203/frontend/src/pages/ChatPage.jsx).
2. You can configure them to check if they are in production and point directly to the Render backend dynamically:
```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-app.onrender.com' 
  : 'http://localhost:5000';
```
This is fully supported and ensures your socket chat channels bridge securely across servers!
