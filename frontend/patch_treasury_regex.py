import re

with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# Replace exact matches with regex for mode and payment_mode
old_1 = '{"$match": {**f, "mode": "cash"}}'
new_1 = '{"$match": {**f, "mode": {"$regex": "^cash$", "$options": "i"}}}'
content = content.replace(old_1, new_1)

old_2 = '{"$match": {**f, "mode": {"$ne": "cash"}}}'
new_2 = '{"$match": {**f, "mode": {"$not": {"$regex": "^cash$", "$options": "i"}}}}'
content = content.replace(old_2, new_2)

old_3 = '{"$match": {**f, "payment_mode": "cash"}}'
new_3 = '{"$match": {**f, "payment_mode": {"$regex": "^cash$", "$options": "i"}}}'
content = content.replace(old_3, new_3)

old_4 = '{"$match": {**f, "payment_mode": {"$ne": "cash"}}}'
new_4 = '{"$match": {**f, "payment_mode": {"$not": {"$regex": "^cash$", "$options": "i"}}}}'
content = content.replace(old_4, new_4)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
