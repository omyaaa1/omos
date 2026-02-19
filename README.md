# Omos Web OS (Backend Edition)

Live demo: https://omyaaa1.github.io/omos/
Git.io short link: (add your short URL here)

This is a web-based OS simulation with a real backend for persistence and services.

## Stack (Chosen)
- Backend: Python + FastAPI
- Storage: SQLite
- Realtime: WebSockets
- Frontend: Vanilla JS + HTML + CSS (minimalist, small fonts, sharp buttons)

## Build / Run
1) Install backend deps
```
python -m venv .venv
.venv\Scripts\activate
pip install -r app/backend/requirements.txt
```

2) Start backend
```
uvicorn app.backend.main:app --reload
```

3) Open frontend
Open `http://127.0.0.1:8000` in a browser.

## Deploy (Vercel)
This repo is Vercel-ready.

1) Import the repo in Vercel.
2) Framework preset: `Other`
3) Build settings: leave defaults.
4) Deploy.

The frontend is served from `public/` and the backend API is served from `/api/*`.

## Usage
- Press Enter on the boot screen to enter the desktop.
- Use the dock or launcher to open apps.
- Writer and Editor autosave to the backend.
- Files app supports list, search, read/write, mkdir, chmod (simulated), extract (simulated).
- Server dashboard supports service toggles and vhost editor.
- Network app toggles VPN/TOR/MAC settings.
- Installer is a multi-step wizard with persistence.

## Progress
- [x] Decide stack and overall app architecture
- [x] Scaffold backend (API, auth/session, storage) and frontend shell
- [x] Implement core OS services + apps with persistence and windowing
- [x] Polish UI (minimalist theme, small fonts, sharp buttons) and reliability

## Notes
- Backend runs on `http://127.0.0.1:8000`
- Frontend is served by the backend (same origin)
