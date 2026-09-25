with open("backend/server.py", "r") as f:
    text = f.read()

events = """
@app.on_event("startup")
async def startup_event():
    start_openwa()

@app.on_event("shutdown")
async def shutdown_event():
    stop_openwa()
"""

if "start_openwa()" not in text:
    text = text.replace('app = FastAPI(title="Unacademy Offline Centre API")', 'app = FastAPI(title="Unacademy Offline Centre API")\n' + events)

with open("backend/server.py", "w") as f:
    f.write(text)
