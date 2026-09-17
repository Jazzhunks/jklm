with open('backend/server.py', 'r') as f:
    lines = f.readlines()

new_lines = []
post_lines = []
in_post = False
app_line_idx = -1

for i, line in enumerate(lines):
    if line.startswith('@app.post("/api/erp/users/fcm-token")'):
        in_post = True
        post_lines.append(line)
    elif in_post:
        post_lines.append(line)
        if line.strip() == 'return {"success": True}':
            in_post = False
    elif line.startswith('app = FastAPI('):
        app_line_idx = len(new_lines)
        new_lines.append(line)
    else:
        new_lines.append(line)

# Insert the post route right after the app instantiation block (which could be a few lines)
# Let's just put it after CORSMiddleware
cors_end_idx = -1
for i, line in enumerate(new_lines):
    if 'CORSMiddleware' in line and 'allow_headers=["*"]' in new_lines[i-1]:
        cors_end_idx = i + 2
        break

if post_lines and cors_end_idx != -1:
    new_lines = new_lines[:cors_end_idx] + post_lines + new_lines[cors_end_idx:]

with open('backend/server.py', 'w') as f:
    f.writelines(new_lines)
