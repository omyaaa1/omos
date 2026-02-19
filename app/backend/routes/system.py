from fastapi import APIRouter
import platform
import time

router = APIRouter()

@router.get("")
def system_info():
    return {
        "os": "Omos Web OS",
        "kernel": platform.release(),
        "arch": platform.machine(),
        "uptime": int(time.time()),
    }
