import requests
import uuid

BASE_URL = "https://nexed-neet.preview.emergentagent.com"
s = requests.Session()
r_login = s.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@northend.edu", "password": "Admin@2025"})
token = r_login.json().get("access_token")
s.headers.update({"Authorization": f"Bearer {token}"})

# 1. Create a branch to assign to staff
branches = s.get(f"{BASE_URL}/api/erp/branches").json()
if not branches:
    print("No branches")
    branch_id = "test-branch"
else:
    branch_id = branches[0]["id"]

# 2. Create attendance user
staff_email = f"att{uuid.uuid4().hex[:4]}@northend.edu"
staff_payload = {
    "name": "Gate Keeper",
    "email": staff_email,
    "phone": "9999999999",
    "password": "Password123",
    "role": "attendance",
    "branch_id": branch_id
}
r_staff = s.post(f"{BASE_URL}/api/erp/staff", json=staff_payload)
print("Create staff:", r_staff.status_code, r_staff.text)

# 3. Login as attendance
s2 = requests.Session()
r_att_login = s2.post(f"{BASE_URL}/api/auth/login", json={"email": staff_email, "password": "Password123"})
print("Attendance login:", r_att_login.status_code, r_att_login.text)

if r_att_login.status_code == 200:
    att_token = r_att_login.json().get("access_token")
    s2.headers.update({"Authorization": f"Bearer {att_token}"})
    
    r_me = s2.get(f"{BASE_URL}/api/erp/me")
    print("Me:", r_me.status_code, r_me.text)
    
    r_att_logs = s2.get(f"{BASE_URL}/api/erp/erpattendance")
    print("Attendance logs:", r_att_logs.status_code)
