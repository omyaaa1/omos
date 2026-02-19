from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.backend.routes import state, storage, terminal, files, system, kv, server, network, installer

app = FastAPI(title="Omos Web OS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)

app.include_router(state.router, prefix="/api/state", tags=["state"])
app.include_router(storage.router, prefix="/api/storage", tags=["storage"])
app.include_router(terminal.router, prefix="/api/terminal", tags=["terminal"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(system.router, prefix="/api/system", tags=["system"])
app.include_router(kv.router, prefix="/api/kv", tags=["kv"])
app.include_router(server.router, prefix="/api/server", tags=["server"])
app.include_router(network.router, prefix="/api/network", tags=["network"])
app.include_router(installer.router, prefix="/api/installer", tags=["installer"])

FRONTEND_DIR = Path(__file__).resolve().parents[1] / "frontend"

@app.get("/")
def root():
    index = FRONTEND_DIR / "index.html"
    if index.exists():
        return FileResponse(index)
    return {"status": "ok", "service": "omos-backend"}

# Serve frontend assets (css, js, etc.) after API routes
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
