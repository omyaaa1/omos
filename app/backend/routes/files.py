from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.backend.services.db import get_storage, set_storage

router = APIRouter()

class PathModel(BaseModel):
    path: str


class SearchModel(BaseModel):
    path: str
    query: str


class ChmodModel(BaseModel):
    path: str
    perms: str


class ExtractModel(BaseModel):
    path: str
    name: str

class WriteModel(BaseModel):
    path: str
    content: str

class MkdirModel(BaseModel):
    path: str


def _get_node(tree, parts):
    node = tree
    for p in parts:
        if p not in node["children"]:
            return None
        node = node["children"][p]
    return node


def _split(path: str):
    clean = path.strip("/")
    return [] if clean == "" else clean.split("/")


def _ensure_attrs(node, node_type):
    if "perms" not in node:
        node["perms"] = "755" if node_type == "dir" else "644"
    if "hidden" not in node:
        node["hidden"] = False
    return node


@router.post("/list")
def list_dir(model: PathModel):
    storage = get_storage()
    node = _get_node(storage["files"]["/"], _split(model.path))
    if not node or node["type"] != "dir":
        raise HTTPException(status_code=404, detail="not found")
    _ensure_attrs(node, "dir")
    return {"entries": list(node["children"].keys())}


@router.post("/read")
def read_file(model: PathModel):
    storage = get_storage()
    node = _get_node(storage["files"]["/"], _split(model.path))
    if not node or node["type"] != "file":
        raise HTTPException(status_code=404, detail="not found")
    _ensure_attrs(node, "file")
    return {"content": node.get("content", "")}


@router.post("/write")
def write_file(model: WriteModel):
    storage = get_storage()
    parts = _split(model.path)
    if not parts:
        raise HTTPException(status_code=400, detail="invalid path")
    parent = _get_node(storage["files"]["/"], parts[:-1]) if len(parts) > 1 else storage["files"]["/"]
    if not parent or parent["type"] != "dir":
        raise HTTPException(status_code=404, detail="parent not found")
    parent["children"][parts[-1]] = {
        "type": "file",
        "content": model.content,
        "perms": "644",
        "hidden": parts[-1].startswith("."),
    }
    set_storage(storage)
    return {"ok": True}


@router.post("/mkdir")
def mkdir(model: MkdirModel):
    storage = get_storage()
    parts = _split(model.path)
    if not parts:
        raise HTTPException(status_code=400, detail="invalid path")
    parent = _get_node(storage["files"]["/"], parts[:-1]) if len(parts) > 1 else storage["files"]["/"]
    if not parent or parent["type"] != "dir":
        raise HTTPException(status_code=404, detail="parent not found")
    if parts[-1] not in parent["children"]:
        parent["children"][parts[-1]] = {
            "type": "dir",
            "children": {},
            "perms": "755",
            "hidden": parts[-1].startswith("."),
        }
    set_storage(storage)
    return {"ok": True}


@router.post("/search")
def search(model: SearchModel):
    storage = get_storage()
    root = _get_node(storage["files"]["/"], _split(model.path))
    if not root or root["type"] != "dir":
        raise HTTPException(status_code=404, detail="not found")

    query = model.query.lower().strip()
    results = []

    def walk(node, base):
        for name, child in node["children"].items():
            path = f"{base}/{name}".replace("//", "/")
            if query in name.lower():
                results.append(path)
            if child["type"] == "dir":
                walk(child, path)

    walk(root, model.path.rstrip("/") or "/")
    return {"results": results}


@router.post("/chmod")
def chmod(model: ChmodModel):
    storage = get_storage()
    node = _get_node(storage["files"]["/"], _split(model.path))
    if not node:
        raise HTTPException(status_code=404, detail="not found")
    node["perms"] = model.perms
    set_storage(storage)
    return {"ok": True}


@router.post("/extract")
def extract(model: ExtractModel):
    storage = get_storage()
    parent = _get_node(storage["files"]["/"], _split(model.path))
    if not parent or parent["type"] != "dir":
        raise HTTPException(status_code=404, detail="not found")
    if model.name in parent["children"]:
        raise HTTPException(status_code=400, detail="exists")
    parent["children"][model.name] = {
        "type": "dir",
        "children": {
            "README.txt": {"type": "file", "content": "Extracted content", "perms": "644", "hidden": False},
            "data.bin": {"type": "file", "content": "010101", "perms": "600", "hidden": False},
        },
        "perms": "755",
        "hidden": False,
    }
    set_storage(storage)
    return {"ok": True}
