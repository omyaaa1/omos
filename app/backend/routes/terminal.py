from fastapi import APIRouter
from pydantic import BaseModel
import datetime

router = APIRouter()

class Cmd(BaseModel):
    command: str

@router.post("")
def run_cmd(cmd: Cmd):
    # Web-safe fake terminal: echo back with timestamps.
    now = datetime.datetime.utcnow().isoformat() + "Z"
    output = f"[{now}] $ {cmd.command}\n{_simulate(cmd.command)}"
    return {"output": output}


def _simulate(command: str) -> str:
    c = command.strip().lower()
    if c in {"help", "?"}:
        return "commands: help, ls, pwd, whoami, date, clear"
    if c == "ls":
        return "Desktop  Documents  Downloads  Projects  Tools"
    if c == "pwd":
        return "/home/omos"
    if c == "whoami":
        return "omos"
    if c == "date":
        return datetime.datetime.utcnow().strftime("%a %b %d %H:%M:%S UTC %Y")
    if c == "clear":
        return ""
    return f"{command}: command not found"
