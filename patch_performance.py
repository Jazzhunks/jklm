import re

with open("backend/server.py", "r") as f:
    text = f.read()

# 1. Fix the DoS limits globally
text = text.replace("le=100000", "le=100")

# 2. Fix the admin_summary bottleneck
old_summary = """@api.get("/admin/summary")
async def admin_summary(_admin = Depends(require_admin)):
    return {
        "total_students": await db.users.count_documents({"role": "student"}),
        "total_courses": await db.courses.count_documents({}),
        "total_enrollments": await db.enrollments.count_documents({}),
        "pending_enrollments": await db.enrollments.count_documents({"status": "pending"}),
        "total_scholarship_apps": await db.scholarship_applications.count_documents({}),
        "total_job_apps": await db.job_applications.count_documents({}),
        "total_inquiries": await db.inquiries.count_documents({}),
        "total_jobs": await db.jobs.count_documents({}),
    }"""

new_summary = """import asyncio

@api.get("/admin/summary")
async def admin_summary(_admin = Depends(require_admin)):
    results = await asyncio.gather(
        db.users.count_documents({"role": "student"}),
        db.courses.count_documents({}),
        db.enrollments.count_documents({}),
        db.enrollments.count_documents({"status": "pending"}),
        db.scholarship_applications.count_documents({}),
        db.job_applications.count_documents({}),
        db.inquiries.count_documents({}),
        db.jobs.count_documents({}),
    )
    return {
        "total_students": results[0],
        "total_courses": results[1],
        "total_enrollments": results[2],
        "pending_enrollments": results[3],
        "total_scholarship_apps": results[4],
        "total_job_apps": results[5],
        "total_inquiries": results[6],
        "total_jobs": results[7],
    }"""

text = text.replace(old_summary, new_summary)

with open("backend/server.py", "w") as f:
    f.write(text)

