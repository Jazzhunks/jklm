import httpx
from fastapi import APIRouter, Request, Response, HTTPException
from starlette.background import BackgroundTask
import subprocess
import os

router = APIRouter()
openwa_process = None
OPENWA_PORT = 2785
OPENWA_URL = f"http://localhost:{OPENWA_PORT}"

def start_openwa():
    global openwa_process
    cwd = os.path.join(os.path.dirname(__file__), "openwa")
    # Start OpenWA
    openwa_process = subprocess.Popen(
        ["npm", "run", "start"],
        cwd=cwd,
        env={**os.environ, "PORT": str(OPENWA_PORT), "API_KEY": "internal_secret"}
    )

def stop_openwa():
    global openwa_process
    if openwa_process:
        openwa_process.terminate()
        openwa_process = None

client = httpx.AsyncClient(base_url=OPENWA_URL)

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_openwa(request: Request, path: str):
    url = httpx.URL(path=request.url.path.replace("/api/openwa", "/api", 1),
                    query=request.url.query.encode("utf-8"))
    
    headers = dict(request.headers)
    headers.pop("host", None)
    headers["x-api-key"] = "internal_secret"
    
    content = await request.body()
    
    try:
        req = client.build_request(
            request.method,
            url,
            headers=headers,
            content=content
        )
        response = await client.send(req, stream=True)
        return Response(
            content=response.aiter_raw(),
            status_code=response.status_code,
            headers=dict(response.headers),
            background=BackgroundTask(response.aclose),
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"OpenWA Gateway Error: {exc}")
