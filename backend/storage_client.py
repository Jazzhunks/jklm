"""Async object-storage helper with local filesystem fallback."""
import os
import asyncio
import logging
import httpx

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = os.environ.get("APP_NAME", "northend")
LOCAL_UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
log = logging.getLogger("storage")

_storage_key: str | None = None
_init_lock = asyncio.Lock()
_client: httpx.AsyncClient | None = None

def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0))
    return _client

async def init_storage() -> str | None:
    """Idempotent. Safe to call concurrently."""
    global _storage_key
    if _storage_key:
        return _storage_key
    async with _init_lock:
        if _storage_key:
            return _storage_key
        key = os.environ.get("EMERGENT_LLM_KEY")
        if not key:
            log.warning("EMERGENT_LLM_KEY missing; using local disk storage fallback.")
            return None
        try:
            r = await _get_client().post(f"{STORAGE_URL}/init", json={"emergent_key": key})
            r.raise_for_status()
            _storage_key = r.json()["storage_key"]
            log.info("Storage init OK")
            return _storage_key
        except Exception as e:
            log.error(f"Storage init failed: {e}; using local disk storage fallback.")
            return None

async def _refresh_key() -> str | None:
    global _storage_key
    _storage_key = None
    return await init_storage()

def _save_local(path: str, data: bytes) -> str:
    """Save data to local filesystem uploads directory."""
    safe_rel_path = path.lstrip("/").replace("..", "_")
    full_path = os.path.join(LOCAL_UPLOADS_DIR, safe_rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "wb") as f:
        f.write(data)
    log.info(f"Saved file locally at {full_path}")
    return full_path

def _read_local(path: str) -> bytes | None:
    """Read data from local filesystem uploads directory if present."""
    safe_rel_path = path.lstrip("/").replace("..", "_")
    full_path = os.path.join(LOCAL_UPLOADS_DIR, safe_rel_path)
    if os.path.isfile(full_path):
        with open(full_path, "rb") as f:
            return f.read()
    return None

async def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = await init_storage()
    if key:
        try:
            client = _get_client()
            r = await client.put(
                f"{STORAGE_URL}/objects/{path}",
                headers={"X-Storage-Key": key, "Content-Type": content_type},
                content=data,
            )
            if r.status_code == 403:
                key = await _refresh_key()
                if key:
                    r = await client.put(
                        f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        content=data,
                    )
            r.raise_for_status()
            return r.json()
        except Exception as e:
            log.warning(f"Remote storage put failed ({e}), falling back to local disk")

    # Local fallback
    _save_local(path, data)
    return {"path": path, "size": len(data), "stored": "local"}

async def get_object(path: str) -> tuple[bytes, str]:
    # Check local disk first
    local_data = _read_local(path)
    if local_data is not None:
        ext = path.split(".")[-1].lower() if "." in path else "bin"
        content_type_map = {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "webp": "image/webp",
            "pdf": "application/pdf",
        }
        return local_data, content_type_map.get(ext, "application/octet-stream")

    key = await init_storage()
    if not key:
        raise RuntimeError("Object not found locally and remote storage not initialised")
    client = _get_client()
    r = await client.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key})
    if r.status_code == 403:
        key = await _refresh_key()
        if key:
            r = await client.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key})
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")

async def aclose():
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None

