🚀 Overview

This project is a React + Redux Toolkit + Vite setup designed as the frontend base for the Laboratory Management System.
It’s clean, persistent, and ready for JWT authentication and future API integration.

This repo includes:

🔧 Redux Toolkit for predictable state management

💾 redux-persist to store login sessions

⚙️ Axios with built-in JWT header handling

🧭 React Router for navigation

🌱 A minimal component structure to scale up easily

🧩 Project Structure
src/
 ├─ configs/
 │   ├─ axios.js           # Axios instance with JWT interceptor
 │   └─ TokenValidator.js  # Placeholder for token validation logic
 │
 ├─ redux/
 │   ├─ features/
 │   │   └─ userSlice.js   # Handles login/logout and user state
 │   ├─ rootReducer.js     # Combines all Redux slices
 │   └─ store.js           # Configures store + persistence
 │
 ├─ routes/
 │   └─ Route.jsx          # Defines all routes
 │
 ├─ pages/
 │   └─ TestPages.jsx      # Test page for Redux & routing check
 │
 ├─ components/            # Reusable UI elements (Button, Card, etc.)
 │
 ├─ layouts/               # Page layouts (MainLayout, AuthLayout, etc.)
 │
 ├─ App.jsx                # Main entry, connects store & router
 └─ main.jsx               # Vite entry file (default)


 ⚙️ Environment Setup

Create two environment files in the root directory:

.env.development
VITE_API_URL=[put development API URL here]
VITE_ENV=development

.env.production
VITE_API_URL=[put production API URL here]
VITE_ENV=production

**Vite automatically picks the correct file based on the build mode.
**These URLs will be used by the Axios instance.

🧠 Core Setup Explanation
🔹 axios.js
Defines a preconfigured Axios instance with an interceptor that automatically attaches JWT tokens to authorized requests.
🔹 store.js
Handles:
    - Redux store creation
    - Redux Persist setup
    - Middleware configuration
The store persists only selected slices via whitelist. (demo setup's whitelist is user)
This ensures login data survives refreshes while avoiding stale cache for other slices.
🔹 userSlice.js
Controls authentication and user session state.
Includes reducers:
    - login: saves token + user info
    - logout: clears both Redux + localStorage
🔹 rootReducer.js
Combines all slices into one Redux state tree.
Add new features here as the app grows.
🔹 TokenValidator.js
Currently a placeholder.
Later, you can enhance it to:
    - Decode JWTs
    - Auto-logout on token expiry
    - Refresh tokens when supported by backend
🔹 Route.jsx
Centralizes all route definitions for the React Router.
You can later expand this with protected routes, layouts, etc.
🔹 App.jsx
Wires everything together — router, Redux provider, and persist gate.

🧱 How to Run Locally
# 1️⃣ Install dependencies
npm install

# 2️⃣ Start dev server
npm run dev

# 3️⃣ Build for production
npm run build

Open http://localhost:5173 to view in your browser.

🧰 Adding New Features
To add a new slice:
    - Create src/redux/features/yourSlice.js
    - Add it to rootReducer.js
    - (Optional) Add it to whitelist in store.js if you want to persist it

To add a new page:
    - Create src/pages/NewPage.jsx
    - Import and register it in routes/Route.jsx


## Below is a breakdown of the key dependencies used in this project and what each one does.

🧠 Core Dependencies

react – Core React library for building the UI.
react-dom – Enables React to render components to the DOM.
react-router-dom – Handles navigation and page routing in the app.
axios – For making HTTP requests to the backend API.
@reduxjs/toolkit – Simplifies Redux setup with slices, reducers, and store configuration.
react-redux – Connects React components to the Redux store.
redux-persist – Persists specific Redux states (like user login) in localStorage.
antd – UI component library providing styled, responsive components.
@ant-design/icons – Official icon pack for Ant Design components.

⚙️ Development Dependencies

vite – Fast development server and build tool for React projects.
@vitejs/plugin-react – Adds React and fast-refresh support to Vite.
eslint – Static code analysis tool to catch bugs and enforce consistent style.
@eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh – ESLint plugins for React-specific linting and hook rules.
globals – Provides common global variables list for ESLint.
@types/react, @types/react-dom – TypeScript type definitions for React (helpful if switching to TS later).    