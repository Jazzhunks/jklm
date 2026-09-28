import os, asyncio, httpx
APP_NAME = os.environ.get("APP_NAME", "northend")

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
LOCAL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
_client, _key, _lock = None, None, asyncio.Lock()

def _get_client():
    global _client
    if not _client: _client = httpx.AsyncClient(timeout=120.0)
    return _client

async def init_storage():
    global _key
    if _key: return _key
    async with _lock:
        if _key: return _key
        if not (k := os.environ.get("EMERGENT_LLM_KEY")): return None
        try:
            r = await _get_client().post(f"{STORAGE_URL}/init", json={"emergent_key": k})
            r.raise_for_status()
            _key = r.json()["storage_key"]
            return _key
        except Exception: return None

def _lpath(p): return os.path.join(LOCAL_DIR, p.lstrip("/").replace("..", "_"))

async def put_object(path: str, data: bytes, content_type: str) -> dict:
    if (key := await init_storage()):
        for _ in range(2):
            try:
                r = await _get_client().put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, content=data)
                if r.status_code == 403:
                    global _key; _key = None; key = await init_storage(); continue
                r.raise_for_status()
                return r.json()
            except Exception: break
    p = _lpath(path)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "wb") as f: f.write(data)
    return {"path": path, "size": len(data), "stored": "local"}

async def get_object(path: str) -> tuple[bytes, str]:
    if os.path.isfile(p := _lpath(path)):
        ext = path.split(".")[-1].lower() if "." in path else "bin"
        mt = {"jpg": "image/jpeg", "png": "image/png", "pdf": "application/pdf"}.get(ext, "application/octet-stream")
        with open(p, "rb") as f: return f.read(), mt
    if not (key := await init_storage()): raise RuntimeError("No storage")
    for _ in range(2):
        r = await _get_client().get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key})
        if r.status_code == 403:
            global _key; _key = None; key = await init_storage(); continue
        r.raise_for_status()
        return r.content, r.headers.get("Content-Type", "application/octet-stream")

async def aclose():
    global _client
    if _client: await _client.aclose(); _client = None
