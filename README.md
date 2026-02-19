# Omos Web OS (Backend Edition)

This is a web-based OS simulation with a real backend for persistence and services.

## Stack (Chosen)
- Backend: Python + FastAPI
- Storage: SQLite
- Realtime: WebSockets
- Frontend: Vanilla JS + HTML + CSS (minimalist, small fonts, sharp buttons)

## Run
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
Open `app/frontend/index.html` in a browser.

## Notes
- Backend runs on `http://127.0.0.1:8000`
- Frontend expects the backend URL in `app/frontend/js/config.js`
