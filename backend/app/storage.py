"""
Persistence for every simulation run. Uses SQLite (Python's standard
library — no extra dependency to install) so results survive a server
restart, and the frontend (or a judge asking "can you show me that again")
can list and replay past runs instead of everything vanishing the moment
a response is sent.

If the on-disk file can't be created or written (some synced/network
folders block SQLite's file locking with a "disk I/O error"), this falls
back to an in-memory store that lasts for the current server process
instead of crashing startup — same philosophy as explain.py's offline
fallback: a broken dependency should degrade the feature, not the demo.

Deliberately NOT wired into /ripple — that route fires on every slider
tick while dragging, and logging every intermediate drag position would
flood the history with noise. Everything else that represents a real
"decision" (a full simulate, a strategy comparison, a stress test, an
adapted plan) gets saved.
"""
import sqlite3
import json
import time
import threading
from pathlib import Path
from typing import Optional, List, Dict

DB_PATH = Path(__file__).resolve().parent.parent / "bottleneck.db"

_SCHEMA = """
CREATE TABLE IF NOT EXISTS scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    config_json TEXT NOT NULL,
    result_json TEXT NOT NULL,
    created_at REAL NOT NULL
)
"""

_fallback_conn: Optional[sqlite3.Connection] = None
_fallback_lock = threading.Lock()


def _using_fallback() -> bool:
    return _fallback_conn is not None


def _connect() -> sqlite3.Connection:
    if _fallback_conn is not None:
        return _fallback_conn
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    global _fallback_conn
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(_SCHEMA)
    except sqlite3.OperationalError as e:
        print(
            f"[storage] Could not use disk-backed database at {DB_PATH} ({e}). "
            "Falling back to an in-memory store for this session — history "
            "will not survive a server restart, but nothing else breaks."
        )
        _fallback_conn = sqlite3.connect(":memory:", check_same_thread=False)
        _fallback_conn.row_factory = sqlite3.Row
        _fallback_conn.execute(_SCHEMA)
        _fallback_conn.commit()


def save_scenario(label: str, config: dict, result: dict) -> int:
    with _fallback_lock if _using_fallback() else _null_lock():
        conn = _connect()
        cur = conn.execute(
            "INSERT INTO scenarios (label, config_json, result_json, created_at) VALUES (?, ?, ?, ?)",
            (label, json.dumps(config), json.dumps(result), time.time()),
        )
        conn.commit()
        return cur.lastrowid


def list_scenarios(limit: int = 50) -> List[Dict]:
    with _fallback_lock if _using_fallback() else _null_lock():
        conn = _connect()
        rows = conn.execute(
            "SELECT id, label, result_json, created_at FROM scenarios ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
        out = []
        for row in rows:
            result = json.loads(row["result_json"])
            out.append(
                {
                    "id": row["id"],
                    "label": row["label"],
                    "cycle_time_days": result.get("cycle_time_days"),
                    "bottleneck_stage": result.get("bottleneck_stage"),
                    "created_at": row["created_at"],
                }
            )
        return out


def get_scenario(scenario_id: int) -> Optional[Dict]:
    with _fallback_lock if _using_fallback() else _null_lock():
        conn = _connect()
        row = conn.execute(
            "SELECT id, label, config_json, result_json, created_at FROM scenarios WHERE id = ?",
            (scenario_id,),
        ).fetchone()
        if row is None:
            return None
        return {
            "id": row["id"],
            "label": row["label"],
            "config": json.loads(row["config_json"]),
            "result": json.loads(row["result_json"]),
            "created_at": row["created_at"],
        }


def delete_scenario(scenario_id: int) -> bool:
    with _fallback_lock if _using_fallback() else _null_lock():
        conn = _connect()
        cur = conn.execute("DELETE FROM scenarios WHERE id = ?", (scenario_id,))
        conn.commit()
        return cur.rowcount > 0


class _null_lock:
    """No-op context manager for the (default) file-backed path, where
    each call gets its own short-lived connection and SQLite handles file
    locking itself — only the shared in-memory fallback needs our lock."""

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False
