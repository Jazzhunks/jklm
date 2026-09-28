from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Literal, Dict, Any

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    school_name: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    school_type: Optional[Literal["middle", "high", "higher_secondary"]] = None


class SendOtpIn(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    action: str = "login" # "login", "register", "forgot"

class VerifyOtpIn(BaseModel):
    phone: str
    code: str
    action: str = "login"

class ResetPasswordIn(BaseModel):
    phone: str
    code: str
    new_password: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

ALLOWED_CATEGORIES = ["NEET", "IIT-JEE", "Foundation", "CBSE", "JKBOSE"]

class CourseIn(BaseModel):
    title: str
    category: Literal["NEET", "IIT-JEE", "Foundation", "CBSE", "JKBOSE"]
    duration: str
    fee: int
    description: str
    syllabus: List[str] = []
    faculty: List[str] = []
    features: List[str] = []
    scholarship_available: bool = True
    featured: bool = False
    image_url: Optional[str] = None

class ScholarshipIn(BaseModel):
    title: str
    description: Optional[str] = ""
    exam_date: Optional[str] = None
    deadline: Optional[str] = None
    eligibility: Optional[str] = None
    venue: Optional[str] = None
    available_venues: List[str] = []
    exam_time: Optional[str] = None
    total_marks: Optional[int] = 100
    whatsapp_community_url: Optional[str] = None
    active: bool = True
    is_featured: bool = False
    kind: Literal["scholarship", "wath"] = "scholarship"
    type: Literal["general", "school"] = "general"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    eligible_classes: List[str] = []
    time_slots: List[Dict[str, Any]] = []

class SchoolTimeSlot(BaseModel):
    from_time: str
    to_time: str
    enabled: bool = True

class ScholarshipApplicationIn(BaseModel):
    name: str
    email: EmailStr
    phone: str
    school: str
    standard: str
    target_exam: str
    city: str
    scholarship_id: Optional[str] = None
    venue: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    # Extra candidate details (for official admit card)
    father_name: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    # WATH Carnival fields
    carnival_id: Optional[str] = None
    chosen_date: Optional[str] = None   # YYYY-MM-DD
    chosen_slot_time: Optional[str] = None  # "10:00 AM"
    otp_code: Optional[str] = None

class ScholarshipApplicationUpdateIn(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    school: Optional[str] = None
    standard: Optional[str] = None
    target_exam: Optional[str] = None
    city: Optional[str] = None
    venue: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    status: Optional[str] = None

class ScholarshipResultIn(BaseModel):
    marks_obtained: float
    total_marks: float = 100
    rank: Optional[int] = None
    percentile: Optional[float] = None
    scholarship_percentage: int
    remarks: Optional[str] = None
    publish: bool = False

class ScholarshipLookupIn(BaseModel):
    phone: str
    application_no: str

class SchoolVisitIn(BaseModel):
    scholarship_id: str
    preferred_date: str
    preferred_slot_time: str
    notes: Optional[str] = None

class SchoolVisitOut(BaseModel):
    id: str
    school_id: str
    school_name: str
    scholarship_id: str
    preferred_date: str
    preferred_slot_time: str
    status: Literal["pending", "approved", "rejected"] = "pending"
    admin_notes: Optional[str] = None
    created_at: str

class SchoolBulkStudentRow(BaseModel):
    name: str
    mobile: str
    current_class: str
    course: str

class SchoolBulkRegisterResult(BaseModel):
    processed: int
    created: int
    skipped: int
    errors: List[str] = []

class AttendanceMarkIn(BaseModel):
    token: str
    application_no: str
    venue: str
    status: Literal["present", "absent"] = "present"

class EnrollmentIn(BaseModel):
    course_id: str
    name: str
    email: EmailStr
    phone: str
    address: str
    center: str
    id_proof_url: Optional[str] = None

class JobIn(BaseModel):
    title: str
    department: str
    location: str
    type: str
    description: str
    requirements: List[str] = []
    active: bool = True
    is_featured: bool = False

class JobApplicationIn(BaseModel):
    name: str
    email: EmailStr
    phone: str
    job_id: str
    qualification: str
    experience: str
    subject_expertise: Optional[str] = None
    preferred_location: str
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None

class NoticeIn(BaseModel):
    title: str
    content: str
    category: str = "General"
    pinned: bool = False
    is_featured: bool = False

class ResultIn(BaseModel):
    student_name: str
    exam: str
    rank: str
    year: int
    course: str
    photo_url: Optional[str] = None
    quote: Optional[str] = None

class ContactIn(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

class PushNotificationIn(BaseModel):
    title: str
    message: str
    target: str = Field("all", pattern="^(all|admin|student)$")
    url: Optional[str] = None
    image: Optional[str] = None

class CenterIn(BaseModel):
    name: str
    city: str
    address: str
    phone: str
    timing: str = "8:00 AM – 8:00 PM"
    lat: float = 34.0837
    lng: float = 74.7973

class TestimonialIn(BaseModel):
    name: str
    role: str
    quote: str

class GalleryItemIn(BaseModel):
    title: str
    description: Optional[str] = None
    media_type: str = "image"  # image | video | text
    media_url: Optional[str] = None
    category: Optional[str] = None
    order: int = 0

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def new_id():
    return str(uuid.uuid4())

def slugify(text: str) -> str:
    text = (text or "").strip().lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return text or "item"

async def unique_slug(collection: str, base: str, exclude_id: str | None = None) -> str:
    slug = slugify(base)
    candidate = slug
    i = 2
    while True:
        q: Dict[str, Any] = {"slug": candidate}
        if exclude_id:
            q["id"] = {"$ne": exclude_id}
        if not await db[collection].find_one(q):
            return candidate
        candidate = f"{slug}-{i}"
        i += 1

