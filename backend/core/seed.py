from core.database import db
from core.utils import *
import uuid

async def _run_initial_seed():
    kashmir_centers = [
        {"id": new_id(), "name": "Unacademy Offline Centre Srinagar", "city": "Srinagar", "address": "Lal Chowk, Srinagar, J&K 190001", "phone": "+91-9876500001", "timing": "8:00 AM – 8:00 PM", "lat": 34.0837, "lng": 74.7973},
        {"id": new_id(), "name": "Unacademy Offline Centre Anantnag", "city": "Anantnag", "address": "KP Road, Anantnag, J&K 192101", "phone": "+91-9876500002", "timing": "8:00 AM – 8:00 PM", "lat": 33.7311, "lng": 75.1487},
        {"id": new_id(), "name": "Unacademy Offline Centre Sopore", "city": "Sopore", "address": "Main Chowk, Sopore, J&K 193201", "phone": "+91-9876500003", "timing": "8:00 AM – 8:00 PM", "lat": 34.2871, "lng": 74.4663},
        {"id": new_id(), "name": "Unacademy Offline Centre Soura", "city": "Soura", "address": "Soura, Srinagar, J&K 190011", "phone": "+91-9876500004", "timing": "8:00 AM – 8:00 PM", "lat": 34.1396, "lng": 74.8005},
        {"id": new_id(), "name": "Unacademy Offline Centre Zakura", "city": "Zakura", "address": "Zakura, Srinagar, J&K 190006", "phone": "+91-9876500005", "timing": "8:00 AM – 8:00 PM", "lat": 34.1373, "lng": 74.8584},
        {"id": new_id(), "name": "Unacademy Offline Centre Parraypora", "city": "Parraypora", "address": "Parraypora, Srinagar, J&K 190015", "phone": "+91-9876500006", "timing": "8:00 AM – 8:00 PM", "lat": 34.0500, "lng": 74.7833},
    ]
    await db.centers.insert_many(kashmir_centers)

    courses_data = [
        ("Class 11–12 NEET", "NEET", "24 months", 95000, "Comprehensive 2-year NEET preparation with Unacademy curriculum.", True, "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800",
         ["Physics", "Chemistry", "Botany", "Zoology", "NCERT Mastery", "Weekly Mock Tests"],
         ["Dr. A. Wani (Physics)", "Mr. R. Bhat (Chemistry)", "Ms. S. Kaur (Biology)"],
         ["1:30 mentor ratio", "Doubt clearing daily", "AIIMS-style test series", "Personal performance dashboard"]),
        ("IIT-JEE Main + Advanced", "IIT-JEE", "24 months", 105000, "Two-year integrated JEE Main + Advanced programme.", True, "https://images.pexels.com/photos/29534728/pexels-photo-29534728.jpeg?w=800",
         ["Mathematics", "Physics", "Chemistry", "Numerical Practice", "Past JEE Papers"],
         ["Mr. F. Lone (Maths)", "Dr. A. Wani (Physics)", "Mr. R. Bhat (Chemistry)"],
         ["Small batches of 30", "Olympiad-grade problem sets", "All-India test ranking", "Doubt sessions 6 days a week"]),
        ("Foundation 8th–10th", "Foundation", "12 months", 35000, "Strong academic foundation with Olympiad training.", False, "https://images.pexels.com/photos/6147219/pexels-photo-6147219.jpeg?w=800",
         ["Maths Foundation", "Science Foundation", "English", "Mental Ability", "Olympiad Prep"],
         ["Ms. M. Khan", "Mr. T. Rather"],
         ["Maths & Science foundation", "Olympiad level preparation", "Mental ability modules", "Small interactive batches"]),
        ("CBSE Class 11–12 Sciences", "CBSE", "24 months", 40000, "CBSE-aligned programme for PCM / PCB streams with Boards-grade rigor.", True, "https://images.unsplash.com/photo-1555967522-37949fc21dcb?w=800",
         ["NCERT Mastery", "Sample Paper Drills", "Practical Lab Notes", "Pre-Board Tests"],
         ["Mr. F. Lone", "Dr. A. Wani", "Ms. S. Kaur"],
         ["100% NCERT coverage", "Boards + competitive integration", "Pre-board mock series"]),
        ("JKBOSE 12th Boards", "JKBOSE", "10 months", 22000, "Targeted JKBOSE board syllabus mastery for Kashmir students.", False, "https://images.pexels.com/photos/29534728/pexels-photo-29534728.jpeg?w=800",
         ["JKBOSE Textbooks", "Weekly Topic Tests", "Previous Year Papers", "Viva Practice"],
         ["Local Faculty Panel"],
         ["JKBOSE-pattern test series", "One-on-one revision plans", "Affordable monthly fee plans"]),
    ]
    await db.courses.insert_many([{"id": new_id(), "title": t, "category": cat, "duration": dur, "fee": fee, "description": desc, "syllabus": syl, "faculty": fac, "features": f, "scholarship_available": True, "featured": feat, "image_url": img, "created_at": now_iso()} for t, cat, dur, fee, desc, feat, img, syl, fac, f in courses_data])

    notices = [
        ("New 2026 NEET Batch Launch", "Admissions open for the new NEET 2026 batch starting March 1.", "Admissions", True),
        ("Scholarship Test 2026", "Unacademy Offline Scholarship Test on Feb 28 — up to 100% fee waiver.", "Scholarship", True),
        ("Foundation Olympiad Workshop", "Free 3-day Olympiad workshop for Class 8–10 students.", "Workshop", False),
    ]
    await db.notices.insert_many([{"id": new_id(), "title": t, "content": c, "category": cat, "pinned": p, "created_at": now_iso()} for t, c, cat, p in notices])

    results_data = [
        ("Aamir Hussain", "NEET 2025", "AIR 412", 2025, "NEET", "Cracked NEET in first attempt with guidance."),
        ("Zoya Bhat", "JEE Advanced 2025", "AIR 1108", 2025, "IIT-JEE", "From Anantnag to IIT Delhi — mentors made the difference."),
        ("Hamid Wani", "NEET 2024", "AIR 587", 2024, "NEET", "Dedicated faculty + structured tests = AIIMS dream realised."),
        ("Sahla Mir", "CUET 2024", "99.4 percentile", 2024, "CUET", "Got admission into Delhi University Hindu College."),
        ("Bilal Ahmad", "JEE Main 2025", "99.1 percentile", 2025, "IIT-JEE", "Best teaching ecosystem in Kashmir, hands down."),
        ("Iqra Jan", "NEET 2025", "AIR 1903", 2025, "NEET", "Made the impossible feel routine."),
    ]
    await db.results.insert_many([{"id": new_id(), "student_name": n, "exam": e, "rank": r, "year": y, "course": c, "photo_url": None, "quote": q, "created_at": now_iso()} for n, e, r, y, c, q in results_data])

    ts = [
        ("Insha Rather", "Parent", "Transformed my daughter's preparation. The faculty truly cares."),
        ("Rayaan Khan", "NEET Aspirant", "Best decision was joining in Srinagar. Mock tests were spot on."),
        ("Mehak Lone", "JEE Aspirant", "Doubt clearing happens in real time — feels like national coaching."),
    ]
    await db.testimonials.insert_many([{"id": new_id(), "name": n, "role": role, "quote": q, "created_at": now_iso()} for n, role, q in ts])

    jobs = [
        ("Physics Faculty (NEET/JEE)", "Academics", "Srinagar", "Full-time", "Senior physics educator for NEET/JEE batches.", ["M.Sc/Ph.D Physics", "3+ years coaching experience"], True),
        ("Counselor", "Admissions", "Anantnag", "Full-time", "Student counseling and parent interactions.", ["Graduate", "Excellent communication"], True),
        ("Floor Manager", "Operations", "Sopore", "Full-time", "Manage center operations and student discipline.", ["Graduate", "Leadership skills"], True),
        ("BDM (Business Dev. Manager)", "Business", "Srinagar", "Full-time", "Drive admissions and outreach across Kashmir.", ["MBA preferred", "5+ years in EdTech"], True),
        ("DTP Operator", "Production", "Srinagar", "Full-time", "Design study material and notices.", ["CorelDraw / InDesign expertise"], True),
    ]
    await db.jobs.insert_many([{"id": new_id(), "title": t, "department": d, "location": l, "type": ty, "description": desc, "requirements": req, "active": a, "created_at": now_iso()} for t, d, l, ty, desc, req, a in jobs])

    await db.scholarships.insert_one({
        "id": "1ed94009-d949-4504-b291-68e3571a5a44", "title": "Unacademy Offline Centre Scholarship Test 2026",
        "description": "Win up to 100% scholarship on tuition fees. Open for Class 8–12 students across Kashmir.",
        "exam_date": "2026-02-28", "deadline": "2026-02-25",
        "eligibility": "Students of Class 8 to 12 from any school in J&K.",
        "active": True,
        "examiner_token": uuid.uuid4().hex,
        "available_venues": ["90 FT", "Anantnag", "Sopore", "Zakura", "Parraypora"],
        "created_at": now_iso(),
    })

