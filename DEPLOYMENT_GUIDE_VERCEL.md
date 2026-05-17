# 🚀 Deployment Guide: Smart Soil Advisory System

Hosting a full-stack application with a machine learning component requires a specialized architecture. Here is the recommended deployment strategy for your project:

## 🏗️ Architecture Overview

1. **Frontend (React/Vite)** -> **Vercel** 🟢 (Perfect for fast, scalable web apps)
2. **Backend (Node.js)** -> **Render or Railway** 🔵 (Best for long-running Node apps)
3. **AI Service (Python)** -> **Render or Railway** 🟣 (Required because Vercel has a 250MB size limit, and ML libraries like `tensorflow` and `scikit-learn` far exceed this limit).
4. **Database** -> **MongoDB Atlas** 🟢 (Cloud-hosted database)

---

## Part 1: Deploying the Frontend to Vercel

Vercel is the best platform for your React/Vite frontend.

### Step 1: Push your code to GitHub
If you haven't already, initialize a git repository, commit your code, and push it to a new GitHub repository.

### Step 2: Import Project on Vercel
1. Go to [Vercel](https://vercel.com/) and sign in.
2. Click **"Add New..." -> "Project"**.
3. Import your GitHub repository.
4. In the **"Framework Preset"** section, Vercel should automatically detect **Vite**.
5. In the **"Root Directory"**, click "Edit" and select your `frontend` folder (e.g., `OmkarProject/frontend` if it's nested).

### Step 3: Add Environment Variables
Before clicking deploy, expand the **"Environment Variables"** section and add:
- **Name**: `VITE_API_BASE_URL`
- **Value**: `https://your-future-backend-url.onrender.com/api` *(You can leave this blank for now and update it after you deploy the backend).*

### Step 4: Deploy
Click **Deploy**. Vercel will build and host your frontend. You'll get a live URL (e.g., `https://smart-soil-frontend.vercel.app`).

---

## Part 2: Deploying the Node.js Backend (Render/Railway)

Your backend needs a continuous server environment to talk to your database and AI service.

1. Create a free account on [Render.com](https://render.com/).
2. Click **"New +" -> "Web Service"**.
3. Connect your GitHub repository.
4. Set the **Root Directory** to your `backend` folder.
5. Set the **Build Command** to: `npm install`
6. Set the **Start Command** to: `node server.js`
7. Add your **Environment Variables** (from your backend `.env` file):
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas Connection String*
   - `JWT_SECRET`: *Your JWT Secret*
   - `GEMINI_API_KEY`: *Your Gemini Key*
   - `AI_SERVICE_URL`: *The URL of your deployed Python AI service*
8. Click **Deploy Web Service**.

---

## Part 3: Deploying the Python AI Service (Render/Railway)

Due to heavy machine learning libraries (`tensorflow`, `scikit-learn`), this must run on a platform like Render that supports Docker or native Python environments without strict size limits.

1. On [Render.com](https://render.com/), click **"New +" -> "Web Service"**.
2. Connect your GitHub repository.
3. Set the **Root Directory** to your `ai-service` folder.
4. Render will automatically detect Python.
5. Set the **Build Command** to: `pip install -r requirements.txt`
6. Set the **Start Command** to: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
7. Add your **Environment Variables**:
   - `GEMINI_API_KEY`: *Your Gemini API Key*
8. Click **Deploy Web Service**.

### ⚠️ Note on Render Free Tier
Render's free tier spins down services after 15 minutes of inactivity. When you wake it up, the AI service might take ~30-50 seconds to load the 36MB `crop_model.pkl` and `tensorflow` libraries.

---

## Part 4: Finalizing Connections

Once all three are deployed:
1. Copy the **AI Service URL** and put it in your **Backend's Environment Variables** (`AI_SERVICE_URL`).
2. Copy the **Backend URL** and put it in your **Frontend's Vercel Environment Variables** (`VITE_API_BASE_URL`).
3. Re-deploy Vercel so the frontend picks up the new backend URL.

Your system is now fully live! 🚀
