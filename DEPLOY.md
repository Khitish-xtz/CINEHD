# Deployment Guide — Deploy CinaHD OTT for Free 🚀

This guide explains how to deploy this application to **Render**'s free tier as a single full-stack web service. Because we've configured the Express server to serve the Vite frontend assets (`/dist`), you only need to manage **one** free service!

---

## Prerequisites

1. **TMDB API Key:** 
   If you don't have one, create a free account at [The Movie Database (TMDB)](https://www.themoviedb.org/) and generate a free API Key in your Account Settings -> API.
2. **GitHub Account:**
   Push your codebase to a private or public GitHub repository.

---

## Hosting on Render (Free Tier)

Render provides free hosting for web services. Since the backend Express server serves the static built client, we can deploy the entire app in one go.

### Step 1: Connect your Repository
1. Go to [Render](https://render.com/) and create a free account.
2. Click **New** -> **Web Service**.
3. Connect your GitHub account and select your `CINAHD-OTT` repository.

### Step 2: Configure Web Service Details
Set the following options in the Render configuration pane:
* **Name:** `cinahd-ott` (or any custom name)
* **Region:** Select the region closest to your audience (e.g., Singapore for Asia, Oregon for US West)
* **Branch:** `main` (or whichever branch holds your active code)
* **Language/Runtime:** `Node`

### Step 3: Configure Build & Start Commands
Scroll down to the commands section and enter:
* **Build Command:**
  ```bash
  npm install && npm run build
  ```
  *(This installs dependencies and compiles the Vite frontend to the `/dist` directory).*
* **Start Command:**
  ```bash
  node server/index.js
  ```
  *(This runs the Express server on Render's designated port).*

### Step 4: Add Environment Variables
Click on the **Advanced** button or go to the **Environment** tab on Render to add your production settings:
1. Click **Add Environment Variable**.
2. Add the following keys:
   * `TMDB_API_KEY`: *Your TMDB API v3 Key (e.g., `a7d8d...`)*
   * `NODE_ENV`: `production`
   * `PORT`: `10000` *(Render will assign this dynamically, but `10000` is Render's standard web port)*

### Step 5: Deploy!
Click **Create Web Service**. 
Render will automatically:
1. Pull your code from GitHub.
2. Install npm packages.
3. Build the Vite production client bundle.
4. Launch the Express server.

Once the logs say `CinaHD Server → http://localhost:10000` and the status changes to **Live**, your application will be accessible at the custom `https://cinahd-ott.onrender.com` URL provided in your dashboard!

---

## Important Tips for Free Tier

> [!NOTE]
> **Cold Starts:** Free services on Render automatically go to sleep after **15 minutes of inactivity**. The next visitor will trigger a "cold start," causing the site to load slowly for 40–50 seconds while the server spins back up. Subsequent pages and requests will be fast.
> 
> If you want to avoid cold starts for free, you can use a free uptime monitoring service like [UptimeRobot](https://uptimerobot.com/) to ping your Render URL every 10–12 minutes to keep it awake.
