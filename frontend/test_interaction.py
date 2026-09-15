import requests

BASE_URL = "https://nexed-neet.preview.emergentagent.com"
s = requests.Session()
r_login = s.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@northend.edu", "password": "Admin@2025"})
print("Login:", r_login.status_code)
if r_login.status_code == 200:
    token = r_login.json().get("access_token")
    if token:
        s.headers.update({"Authorization": f"Bearer {token}"})
        r_leads = s.get(f"{BASE_URL}/api/erp/leads")
        print("Leads status:", r_leads.status_code)
        if r_leads.status_code == 200:
            leads = r_leads.json()
            if leads:
                lead_id = leads[0]["id"]
                r_int = s.post(f"{BASE_URL}/api/erp/leads/{lead_id}/interactions", json={
                    "type": "call",
                    "notes": "Testing interaction"
                })
                print("Interaction response:", r_int.status_code, r_int.text)
