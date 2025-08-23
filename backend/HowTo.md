# Deploying an Application on Vercel

## Prerequisites
1. Ensure you have both the **frontend** and **backend** code hosted on **GitHub**.
2. A **Vercel** account is required. If you don't have one, you can [sign up here](https://vercel.com/signup).

## Step 1: Login to Vercel
1. Visit [vercel.com](https://vercel.com) and log in to your account using your GitHub credentials.
2. Once logged in, click on the **"Add New Project"** button from your Vercel dashboard.

## Step 2: Connect GitHub with Vercel
1. After clicking "Add New Project", you’ll be prompted to connect your **GitHub** account with Vercel.
2. Authorize Vercel to access your GitHub repositories. This will allow Vercel to fetch and manage your projects directly from GitHub.
3. After linking GitHub, you will see a list of all your GitHub repositories.

## Step 3: Import the Backend Project
1. From the list of repositories, find the one that contains your **backend** code and click **"Import"**.
2. Give your project a name (this will be the name of your Vercel project).
3. In the project settings, make sure to select the correct **root directory** where your backend code resides. If your backend code is in a folder called `backend`, set that as the root.
4. **Configure Environment Variables**: Add any necessary environment variables for the backend (e.g., MongoDB URI, JWT secret, etc.).
   - To add environment variables:
     - Click on **"Environment Variables"**.
     - Add variables such as `MONGO_URI`, `JWT_SECRET`, and any other variables your backend requires.
     - Example:
       ```env
       MONGO_URI=your_mongodb_connection_string
       JWT_SECRET=your_jwt_secret_key
       PORT=5000
       ```
5. Once everything is set up, click on **"Deploy"**. Vercel will build and deploy your backend. You will be provided with a URL for the live backend once the deployment is complete.

## Step 4: Import the Frontend Project
1. After successfully deploying the backend, go back to the **"Add New Project"** section and repeat the process for the **frontend**.
2. Select the repository that contains your **frontend** code and click **"Import"**.
3. As with the backend, give the frontend project a name and select the correct **root directory** for your frontend (e.g., if your frontend code is in a folder called `frontend`, set that as the root).
4. Set the **build command** to `npm run build` and the **output directory** to `build`.
5. If your frontend relies on any **environment variables** (like API URLs to connect to the backend), add them in the same way as you did for the backend.
6. Click **"Deploy"** to deploy the frontend. Vercel will provide you with a live URL for your frontend once the deployment is complete.

## Step 5: Testing the Application
1. After deploying both the frontend and backend, open the live URLs provided by Vercel.
2. Test the application to ensure the frontend is properly connecting to the backend and the entire application is functioning as expected.

---

That's it! You've successfully deployed your MERN application on Vercel.
