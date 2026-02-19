from fastapi import APIRouter
from pydantic import BaseModel
from app.backend.services.db import get_storage, set_storage

router = APIRouter()

class StorageModel(BaseModel):
    files: dict

@router.get("")
def read_storage():
    return get_storage()

@router.post("")
def write_storage(storage: StorageModel):
    set_storage(storage.dict())
    return {"ok": True}
