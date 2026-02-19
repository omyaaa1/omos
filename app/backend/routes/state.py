from fastapi import APIRouter
from pydantic import BaseModel
from app.backend.services.db import get_state, set_state

router = APIRouter()

class StateModel(BaseModel):
    windows: list = []
    settings: dict = {}

@router.get("")
def read_state():
    return get_state()

@router.post("")
def write_state(state: StateModel):
    set_state(state.dict())
    return {"ok": True}
