import re

with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# 1. Update ROLES_BRANCH
content = content.replace(
    'ROLES_BRANCH = {"center_manager", "accountant", "counsellor"}',
    'ROLES_BRANCH = {"center_manager", "accountant", "counsellor", "attendance"}'
)

# 2. Update StaffCreate Literal
content = content.replace(
    'role: Literal["center_manager", "accountant", "counsellor"]',
    'role: Literal["center_manager", "accountant", "counsellor", "attendance"]'
)

# 3. Update StaffUpdate Literal
content = content.replace(
    'role: Optional[Literal["center_manager", "accountant", "counsellor"]] = None',
    'role: Optional[Literal["center_manager", "accountant", "counsellor", "attendance"]] = None'
)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
