**Project Overview**
- **Name**: `laboratory-iamservice-frontend`
- **Purpose**: Front-end single-page application for the Laboratory IAM Service. It provides authentication, user/role management UIs and consumes the backend APIs exposed by the IAM microservices.

**Quick Start**
- **Prerequisites**: Node.js (>=16), npm, backend services running or reachable (see `VITE_API_URL`).
- **Install dependencies**:

```powershell
npm install
```

- **Run development server** (hot-reload):

```powershell
npm run dev
```

- **Build for production**:

```powershell
npm run build
```

- **Preview production build**:

```powershell
npm run preview
```

**Scripts**
- **`dev`**: Launches Vite dev server (`vite`).
- **`build`**: Builds production assets (`vite build`).
- **`preview`**: Serves the production build locally (`vite preview`).
- **`lint`**: Runs ESLint over the source tree (`eslint .`).

These scripts are defined in `package.json`.

**Environment / Configuration**
- This project uses Vite env variables. All public env variables must begin with the `VITE_` prefix and are accessible via `import.meta.env`.
- Important variables:
    - **`VITE_API_URL`**: Base URL for the backend API. The app's HTTP clients (`src/configs/axios.js` and `src/configs/publicAxios.js`) use this value as `baseURL`.
    - **`VITE_ENABLE_CLAUDE_HAIKU`** (suggested): Example flag to enable the `Claude Haiku 4.5` feature for all clients. Set to `1` or `true` to enable. Example usage in code: `const enabled = import.meta.env.VITE_ENABLE_CLAUDE_HAIKU === '1'`.

Example `.env` for local development (create `.env.local` or use your preferred env management):

```text
VITE_API_URL=http://localhost:8080
VITE_ENABLE_CLAUDE_HAIKU=1
```

**Feature Flags**
- Short-term / simple flags: Use `VITE_` env variables and rebuild for global toggles.
- Recommendation for production: use a feature-flag service (LaunchDarkly, Flagsmith, etc.) or a server-side feature endpoint so runtime toggles don't require rebuilds. The frontend can fetch a `/api/features` endpoint on startup and enable/disable behavior client-side.

**API Contract / Authentication**
- The client expects the backend API to be reachable at `VITE_API_URL`.
- HTTP clients:
    - `src/configs/axios.js` — authenticated requests; adds `Authorization` header if token exists in storage and implements refresh flow (`/api/auth/refresh`).
    - `src/configs/publicAxios.js` — public requests.
- Auth flows and token parsing are implemented in `src/utils/jwtUtil.js` and `src/redux/features/userSlice.js`.

**Project Structure (high level)**n+ - `src/` — application source
    - `src/components/` — UI components and modal dialogs
    - `src/pages/` — route pages and views
    - `src/configs/` — `axios` clients and app-level configuration
    - `src/redux/` — store and slices (user, auth, etc.)
    - `src/utils/` — helper utilities
- `index.html`, `vite.config.js` — Vite entry and configuration

**Styling**
- Uses `Tailwind CSS` and `Ant Design` for layout & components. See `tailwindcss` and `antd` dependencies in `package.json`.

**Linting & Formatting**
- ESLint configured; run `npm run lint` to check the codebase.

**Docker / Deployment**
- The repository root contains a `docker-compose.yml` that composes frontend and backend for local deployment. The frontend can be served as a static site behind a webserver or served from a simple container.
- If building a containerized frontend, build the production assets (`npm run build`) and serve `dist/` with a static server (e.g. `nginx` image). Keep env values for runtime (API URL and flags) in your hosting environment or use an injection mechanism during image start.

**Testing**
- No unit test runner is defined in `package.json`. Add testing frameworks (Vitest/Jest/React Testing Library) if required.

**MCP Notes (Model Context Protocol README guidance)**
- **Purpose**: Provide environment and runtime expectations so model/agents can interact with the frontend during local dev or CI.
- **Entry points**:
    - Local dev server: `http://localhost:5173` (default Vite port) after `npm run dev`.
    - API base: `import.meta.env.VITE_API_URL`.
- **Feature toggles**: `Claude Haiku 4.5` can be enabled for all clients via `VITE_ENABLE_CLAUDE_HAIKU=1` or controlled by a runtime feature endpoint:
    - Server approach: Provide `/api/features` that returns JSON toggles. Frontend should fetch this at bootstrap and store it in Redux for consistent access.
- **Observability hooks**: For model-driven tests or user-simulated flows, ensure API endpoints return predictable response shapes; the axios clients already centralize auth and refresh logic.

**Contributing & PR Guidance**
- Keep UI changes small and componentized.
- Update README env notes if adding new `VITE_` variables.
- When adding a feature flag used by both backend and frontend, sync names and default values across services.

**Who to contact**
- Project owner / maintainer: check repository `README.md` in the repo root for team details.

---

File created by the development assistant to capture MCP-focused operational details for `laboratory-iamservice-frontend`. If you want, I can:
- Add a runtime `/api/features` fetch example and small Redux slice for feature flags.
- Create a Dockerfile example to serve the `dist/` folder with `nginx`.

If you'd like any of those follow-ups, tell me which one to implement next.