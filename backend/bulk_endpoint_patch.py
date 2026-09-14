import re

with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

endpoint = """
    @erp.post("/id-cards/bulk-download")
    async def download_bulk_id_cards(payload: Dict[str, Any], user: dict = Depends(require_erp)):
        student_ids = payload.get("student_ids", [])
        if not student_ids:
            raise HTTPException(400, "No students selected")
        f = {"id": {"$in": student_ids}}
        if user["role"] != "super_admin":
            f["branch_id"] = user.get("branch_id")
            
        students = await db.erp_students.find(f, {"_id": 0}).to_list(len(student_ids))
        if not students:
            raise HTTPException(404, "No students found")
            
        students_data = []
        for s in students:
            b = await db.centers.find_one({"id": s["branch_id"]}, {"_id": 0}) or {}
            c = await db.courses.find_one({"id": s.get("course_id")}, {"_id": 0}) or {}
            
            photo_bytes = None
            photo_url = s.get("photo_url")
            if photo_url and photo_url.startswith("/api/files/"):
                file_id = photo_url.split("/")[-1]
                file_record = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
                if file_record:
                    try:
                        from storage_client import get_object
                        photo_bytes, _ = await get_object(file_record["storage_path"])
                    except Exception:
                        pass
            
            students_data.append({
                "full_name": s.get("full_name"),
                "student_no": s.get("student_no"),
                "enrollment_number": s.get("enrollment_number"),
                "course": c.get("title") or s.get("batch") or "COURSE",
                "branch": b.get("name"),
                "photo_bytes": photo_bytes
            })
            
        try:
            from pdf_client import bulk_id_card_pdf
            import io
            pdf_bytes = bulk_id_card_pdf(students_data)
        except Exception as e:
            raise HTTPException(500, f"Bulk ID card generation failed: {e}")
            
        filename = "bulk-id-cards.pdf"
        from fastapi.responses import StreamingResponse
        return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
"""

content = content.replace("@erp.get(\"/id-cards/scan/{enrollment_number}\")", endpoint + "\n    @erp.get(\"/id-cards/scan/{enrollment_number}\")")

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
