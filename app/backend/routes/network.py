from fastapi import APIRouter
from pydantic import BaseModel
from app.backend.services.db import kv_get, kv_set

router = APIRouter()

class NetState(BaseModel):
    vpn: bool
    tor: bool
    mac_random: bool

@router.get("")
def get_state():
    return kv_get("network", {"vpn": False, "tor": False, "mac_random": True})

@router.post("")
def set_state(state: NetState):
    kv_set("network", state.model_dump())
    return {"ok": True}
