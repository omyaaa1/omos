from fastapi import APIRouter
from pydantic import BaseModel
from app.backend.services.db import kv_get, kv_set

router = APIRouter()

class InstallState(BaseModel):
    step: int
    data: dict

@router.get("")
def get_state():
    return kv_get("installer", {"step": 0, "data": {}})

@router.post("")
def set_state(state: InstallState):
    kv_set("installer", state.dict())
    return {"ok": True}
