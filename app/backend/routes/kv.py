from fastapi import APIRouter
from pydantic import BaseModel
from app.backend.services.db import kv_get, kv_set

router = APIRouter()

class KVGet(BaseModel):
    key: str
    default: object | None = None

class KVSet(BaseModel):
    key: str
    value: object

@router.post("/get")
def get_value(model: KVGet):
    return {"value": kv_get(model.key, model.default)}

@router.post("/set")
def set_value(model: KVSet):
    kv_set(model.key, model.value)
    return {"ok": True}
