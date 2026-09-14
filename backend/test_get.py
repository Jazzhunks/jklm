import requests

login_payload = {
    "email": "admin@northend.edu",
    "password": "Admin@2025"
}
s = requests.Session()
r_login = s.post("https://nexed-neet.preview.emergentagent.com/api/auth/login", json=login_payload)
token = r_login.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

r = s.get("https://nexed-neet.preview.emergentagent.com/api/erp/students", headers=headers)
print("GET Students:", r.status_code)
print(r.text[:500])
