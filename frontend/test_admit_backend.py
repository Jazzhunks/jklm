with open("../backend/routers/scholarships.py", "r") as f:
    for i, line in enumerate(f):
        if "admit-card" in line:
            print(f"{i}: {line.strip()}")
