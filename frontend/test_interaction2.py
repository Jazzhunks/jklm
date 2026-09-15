import requests

BASE_URL = "https://nexed-neet.preview.emergentagent.com"
s = requests.Session()
r_login = s.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@northend.edu", "password": "Admin@2025"})
token = r_login.json().get("access_token")
s.headers.update({"Authorization": f"Bearer {token}"})
leads = s.get(f"{BASE_URL}/api/erp/leads").json()
lead_id = leads[0]["id"]
r_int = s.post(f"{BASE_URL}/api/erp/leads/{lead_id}/interactions", json={
    "type": "note",
    "notes": "Testing interaction with date",
    "next_followup_at": "2026-10-10T10:00:00.000Z"
})
print("Interaction 2 response:", r_int.status_code, r_int.text)
