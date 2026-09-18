import httpx
from fastapi import APIRouter, Request, Response, HTTPException
from starlette.background import BackgroundTask
import subprocess
import os
import re

router = APIRouter()
openwa_process = None
OPENWA_PORT = 2785
OPENWA_URL = f"http://localhost:{OPENWA_PORT}"

def start_openwa():
    global openwa_process
    cwd = os.path.join(os.path.dirname(__file__), "openwa")
    
    # Auto-install and build if missing (crucial for remote environments)
    if not os.path.exists(os.path.join(cwd, "node_modules")):
        print("OpenWA node_modules missing. Installing...", flush=True)
        subprocess.run(["npm", "install"], cwd=cwd)
    
    if not os.path.exists(os.path.join(cwd, "dist")):
        print("OpenWA dist missing. Building...", flush=True)
        subprocess.run(["npm", "run", "build:all"], cwd=cwd)

    print("Starting OpenWA Engine...", flush=True)
    log_file = open(os.path.join(cwd, "openwa.log"), "w")
    openwa_process = subprocess.Popen(
        ["npm", "run", "prod"],
        cwd=cwd,
        env={**os.environ, "PORT": str(OPENWA_PORT), "API_MASTER_KEY": "internal_secret"},
        stdout=log_file,
        stderr=subprocess.STDOUT
    )

def stop_openwa():
    global openwa_process
    if openwa_process:
        openwa_process.terminate()
        openwa_process = None

client = httpx.AsyncClient(base_url=OPENWA_URL, timeout=30.0)


@router.get("/logs")
async def get_openwa_logs():
    log_path = os.path.join(os.path.dirname(__file__), "openwa", "openwa.log")
    if os.path.exists(log_path):
        with open(log_path, "r") as f:
            return Response(content=f.read(), media_type="text/plain")
    return {"error": "Log file not found"}

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])

async def proxy_openwa(request: Request, path: str):
    # Forward to the exact path on OpenWA
    forward_path = f"/{path}"
    
    url = httpx.URL(path=forward_path, query=request.url.query.encode("utf-8"))
    
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("accept-encoding", None) # Disable encoding so we can string-replace HTML
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
        
        # If it's the root HTML, rewrite the asset paths
        content_type = response.headers.get("content-type", "")
        if "text/html" in content_type and response.status_code == 200:
            await response.aread()
            html = response.text
            html = re.sub(r'href="/(?!api/openwa)', 'href="/api/openwa/', html)
            html = re.sub(r'src="/(?!api/openwa)', 'src="/api/openwa/', html)
            return Response(
                content=html,
                status_code=response.status_code,
                headers={k: v for k, v in response.headers.items() if k.lower() not in ("content-length", "transfer-encoding")},
                media_type="text/html"
            )
            
        return Response(
            content=response.aiter_raw(),
            status_code=response.status_code,
            headers=dict(response.headers),
            background=BackgroundTask(response.aclose),
        )
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"OpenWA Gateway Error: {exc}")
