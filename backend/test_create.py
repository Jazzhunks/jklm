import requests

login_payload = {
    "email": "admin@northend.edu",
    "password": "Admin@2025"
}
s = requests.Session()
r_login = s.post("https://nexed-neet.preview.emergentagent.com/api/auth/login", json=login_payload)
token = r_login.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

r_students = s.get("https://nexed-neet.preview.emergentagent.com/api/erp/students", headers=headers)
student = r_students.json()[0]
branch_id = student.get("branch_id")
course_id = student.get("course_id")

payload = {
    "full_name": "Test Student 500",
    "gender": "Male",
    "dob": "2000-01-01",
    "address": "123 Test St",
    "contact_phone": "1234567890",
    "contact_email": "test@test.com",
    "parent_name": "Parent",
    "parent_phone": "0987654321",
    "parent_email": "parent@test.com",
    "current_class": "Class 10",
    "course_id": course_id,
    "batch": "test-batch",
    "batch_timing": "Morning",
    "course_duration": "1 Year",
    "branch_id": branch_id,
    "total_fee": 1000,
    "scholarship_percent": 0,
    "discount": 0
}

r = s.post("https://nexed-neet.preview.emergentagent.com/api/erp/students", headers=headers, json=payload)
print("Create:", r.status_code)
print(r.text)
print(r.headers)
