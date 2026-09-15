with open("src/lib/roles.js", "r") as f:
    content = f.read()

old_roles = """export const ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  CENTER_MANAGER: 'center_manager',
  ACCOUNTANT: 'accountant',
  COUNSELLOR: 'counsellor',
  SCHOOL: 'school',
  STUDENT: 'student',
};"""

new_roles = """export const ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  CENTER_MANAGER: 'center_manager',
  ACCOUNTANT: 'accountant',
  COUNSELLOR: 'counsellor',
  ATTENDANCE: 'attendance',
  SCHOOL: 'school',
  STUDENT: 'student',
};"""

old_erp = """export const ERP_ROLES = [
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
  ROLES.CENTER_MANAGER,
  ROLES.ACCOUNTANT,
  ROLES.COUNSELLOR,
];"""

new_erp = """export const ERP_ROLES = [
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
  ROLES.CENTER_MANAGER,
  ROLES.ACCOUNTANT,
  ROLES.COUNSELLOR,
  ROLES.ATTENDANCE,
];"""

content = content.replace(old_roles, new_roles).replace(old_erp, new_erp)

with open("src/lib/roles.js", "w") as f:
    f.write(content)
print("Done patching roles.js")
