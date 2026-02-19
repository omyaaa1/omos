from pathlib import Path
import json
import sqlite3

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "omos.db"


def _conn():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL)"
    )
    return conn


def _get_json(key: str, default):
    with _conn() as conn:
        row = conn.execute("SELECT value FROM kv WHERE key = ?", (key,)).fetchone()
        if not row:
            return default
        try:
            return json.loads(row[0])
        except Exception:
            return default


def _set_json(key: str, value):
    payload = json.dumps(value)
    with _conn() as conn:
        conn.execute(
            "INSERT INTO kv(key, value) VALUES(?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            (key, payload),
        )


def get_state():
    return _get_json("state", {"windows": [], "settings": {}})


def set_state(state):
    _set_json("state", state)


def get_storage():
    return _get_json(
        "storage",
        {
            "files": {
                "/": {
                    "type": "dir",
                    "children": {},
                    "perms": "755",
                    "hidden": False,
                }
            }
        },
    )


def set_storage(storage):
    _set_json("storage", storage)


def kv_get(key: str, default=None):
    return _get_json(f"kv:{key}", default)


def kv_set(key: str, value):
    _set_json(f"kv:{key}", value)
