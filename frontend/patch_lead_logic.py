with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# 1. Propose logic
old_propose_db = """            "proposed_fee": payload.proposed_fee,
            "moving_to_class": payload.moving_to_class,
            "preferred_batch": payload.batch_name,
        }})"""
new_propose_db = """            "proposed_fee": payload.proposed_fee,
            "moving_to_class": payload.moving_to_class,
            "course": payload.course,
            "preferred_batch": payload.batch_name,
        }})"""
content = content.replace(old_propose_db, new_propose_db)

# 2. Enroll logic
old_enroll_db = """            "contact_phone": payload.contact_phone,
            "current_class": payload.current_class,
            "batch": payload.batch,"""
new_enroll_db = """            "contact_phone": payload.contact_phone,
            "current_class": payload.current_class,
            "course_id": payload.course,
            "batch": payload.batch,"""
content = content.replace(old_enroll_db, new_enroll_db)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
print("Done patching lead logic")
