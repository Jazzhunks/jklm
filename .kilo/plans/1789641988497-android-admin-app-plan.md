# Android Admin App — Implementation Plan

## Goal
Build a native Android app (Kotlin + Jetpack Compose) that consumes the existing NorthEnd backend APIs (`https://northendedu.com/api`) and provides admin/ERP functionality. The app shares the same backend as the website but has no WebView fallback.

## Verified Backend Contract (from code)
- **Base URL:** `https://northendedu.com` (frontend/.env)
- **API prefix:** `/api`
- **Login:** `POST /api/auth/login` → `{ user, access_token, refresh_token }`
- **Refresh:** `POST /api/auth/refresh` → body `{ refresh_token }` or cookie → `{ access_token, refresh_token, user }`
- **Me:** `GET /api/auth/me` and `GET /api/erp/me`
- **Roles:** `super_admin`, `admin`, `center_manager`, `accountant`, `counsellor`, `attendance`
- **ERP prefix:** `/api/erp/...` (mounted via `erp_routes.py` with `prefix="/erp"`)
- **CORS:** Fixed origin list + regex for `emergentagent.com`, `emergent.host`, `northendedu.com`. Native OkHttp does not send `Origin` header by default, so CORS is not a blocker.
- **File upload:** `POST /api/upload` (multipart), `POST /api/erp/students/{id}/photo` (multipart)

## Key ERP Endpoints
| Module | Method | Path |
|---|---|---|
| Auth | POST | `/auth/login` |
| Auth | POST | `/auth/refresh` |
| Auth | GET | `/auth/me` |
| ERP Me | GET | `/erp/me` |
| Meta | GET | `/erp/meta` |
| Students | GET | `/erp/students` (supports `branch_id`, `q`, `search`, `batch`, `status`, `skip`, `limit`) |
| Students | POST | `/erp/students` |
| Students | PATCH | `/erp/students/{id}` |
| Students | DELETE | `/erp/students/{id}` |
| Students | POST | `/erp/students/{id}/photo` (multipart) |
| Students | GET | `/erp/students/{id}/statement` |
| Students | GET | `/erp/students/lookup` |
| Payments | GET | `/erp/payments` (supports `branch_id`, `student_id`, `mode`, `search`, `from_date`, `to_date`, `skip`, `limit`) |
| Payments | POST | `/erp/payments` |
| Payments | PATCH | `/erp/payments/{id}` |
| Payments | DELETE | `/erp/payments/{id}` |
| Receipt | GET | `/erp/receipts/{receipt_no}` (`?format=a4|thermal`) |
| Expenses | GET | `/erp/expenses` (supports `branch_id`, `category`, `status`, `search`, `from_date`, `to_date`, `skip`, `limit`) |
| Expenses | POST | `/erp/expenses` |
| Expenses | POST | `/erp/expenses/{id}/decision` |
| Leads | GET | `/erp/leads` |
| Leads | POST | `/erp/leads` |
| Leads | PATCH | `/erp/leads/{id}` |
| Leads | POST | `/erp/leads/{id}/propose` |
| Leads | POST | `/erp/leads/{id}/approve` |
| Leads | POST | `/erp/leads/{id}/enroll` |
| Staff | GET | `/erp/staff` |
| Staff | POST | `/erp/staff` |
| Staff | PATCH | `/erp/staff/{id}` |
| Staff | DELETE | `/erp/staff/{id}` |
| Branches | GET | `/erp/branches` |
| Branches | PATCH | `/erp/branches/{id}` |
| Attendance | GET | `/erp/erpattendance` |
| Attendance | POST | `/erp/erpattendance/scan` |
| Attendance | POST | `/erp/erpattendance/override` |
| Dashboard | GET | `/erp/dashboard/super` |
| Dashboard | GET | `/erp/dashboard/branch/{branch_id}` |
| Audit | GET | `/erp/audit` |
| ID Cards | GET | `/erp/id-cards/queue` |
| GST | GET | `/erp/gst/monthly` |
| GST | POST | `/erp/gst/mark-paid` |
| Exports | GET | `/erp/exports/gst.xlsx`, `payments.xlsx`, `expenses.xlsx`, `students.xlsx` |
| Treasury | GET | `/erp/treasury/summary` |
| Treasury | GET | `/erp/treasury/transfers` |
| Treasury | POST | `/erp/treasury/transfers` |
| Public courses | GET | `/courses` |
| Notices | GET/POST | `/notices` |
| Centers | GET/POST | `/centers` |
| Gallery admin | GET/POST | `/admin/gallery` |
| Posts admin | GET/POST | `/admin/posts` |

## App Architecture
- **Language:** Kotlin
- **UI:** Jetpack Compose (Material 3)
- **Architecture:** MVVM + Repository + UseCase
- **Networking:** Retrofit + OkHttp + Moshi
- **Async:** Kotlin Coroutines + Flow
- **DI:** Hilt
- **Image loading:** Coil
- **Date/Time:** ThreeTenABP
- **PDF:** Android PrintHelper / PdfRenderer
- **Secure storage:** EncryptedSharedPreferences

## Project Location
Create new Android project at: `/Users/mudasirmushtaq/Documents/app/northend/android-admin`

## Implementation Order
1. **Project scaffold** — `build.gradle.kts`, `AndroidManifest.xml`, Hilt module, Retrofit base URL, OkHttp interceptors (Auth + Refresh), Moshi adapters.
2. **Secure token storage** — `TokenManager` using EncryptedSharedPreferences.
3. **Auth screens** — Login (email + password), splash/check-auth, logout.
4. **ERP shell** — Role-gated bottom nav or drawer; `super_admin` sees all, other roles see subset.
5. **Dashboard** — Super dashboard (`/erp/dashboard/super`) and branch dashboard (`/erp/dashboard/branch/{id}`).
6. **Students module** — List with search/filter/pagination, create/edit form, photo upload, statement view.
7. **Payments module** — List with filters, create payment, receipt download/print.
8. **Expenses module** — List with filters, create expense, approve/reject decision.
9. **Leads module** — List, create, propose, approve, reject, enroll, interactions timeline.
10. **Staff module** — List, create, update, deactivate.
11. **Branches module** — List, update branch details.
12. **Attendance module** — Scan input, manual override, logs list.
13. **Comms & Ops** — WhatsApp campaigns list/send, ID card queue, push notifications.
14. **Exports** — GST XLSX, payments XLSX, expenses XLSX, students XLSX download.
15. **Error handling & polish** — 401 logout flow, loading states, empty states, role-based UI gating, ProGuard rules.

## Security Requirements
- Tokens in EncryptedSharedPreferences only.
- Bearer token in `Authorization` header; never in query params.
- Silent refresh via OkHttp interceptor with single-flight lock.
- On refresh failure: clear tokens, redirect to login.
- No logging of tokens or PII.
- `FLAG_SECURE` on sensitive screens.
- Role checks mirror backend exactly:
  - `super_admin`: full access
  - `center_manager`: branch-scoped + finance
  - `accountant`: payments, expenses, students
  - `counsellor`: leads + students (cannot create students, cannot update photos)
  - `attendance`: attendance only

## Validation Steps
1. Run backend locally: `uvicorn server:app --reload --port 8001`.
2. Point app `BASE_URL` to local backend.
3. Login with existing admin/staff credentials from DB.
4. Verify each module screen against live backend responses.
5. Test pagination, search, filters on Students, Payments, Expenses, Leads.
6. Test role restrictions by logging in as each role and verifying UI + API 403s.
7. Test refresh token expiry and silent re-auth flow.
8. Test offline token presence: app should redirect to login if tokens are cleared.

## Out of Scope
- WebView fallback to website (explicitly excluded).
- Push notification receiving/sending via OneSignal (backend handles it).
- WhatsApp Cloud API direct integration (backend handles it).
- Student-facing portal (separate concern).
- Biometric auth (optional future enhancement).
