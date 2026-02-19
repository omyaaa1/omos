from fastapi import APIRouter
from pydantic import BaseModel
from app.backend.services.db import kv_get, kv_set

router = APIRouter()

class ServiceToggle(BaseModel):
    name: str
    running: bool

class VHost(BaseModel):
    domain: str
    root: str

@router.get("")
def get_status():
    return kv_get(
        "services",
        {
            "web": True,
            "db": True,
            "queue": False,
            "nginx": True,
            "apache": False,
        },
    )

@router.post("/toggle")
def toggle_service(model: ServiceToggle):
    services = kv_get("services", {})
    services[model.name] = model.running
    kv_set("services", services)
    return {"ok": True}

@router.get("/logs")
def logs():
    return {
        "lines": [
            "[info] web: ready",
            "[info] db: ready",
            "[warn] queue: idle",
        ]
    }

@router.get("/vhosts")
def vhosts():
    return kv_get("vhosts", [])

@router.post("/vhosts")
def add_vhost(vhost: VHost):
    vhosts = kv_get("vhosts", [])
    vhosts.append(vhost.model_dump())
    kv_set("vhosts", vhosts)
    return {"ok": True}
