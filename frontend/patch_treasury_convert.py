import re

with open("../backend/erp_routes.py", "r") as f:
    content = f.read()

# Replace the pipeline group stage with a conversion stage first
old_pipeline_1 = """        cash_in_pipeline = [
            {"$match": {**f, "mode": {"$regex": "^cash$", "$options": "i"}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]"""
new_pipeline_1 = """        cash_in_pipeline = [
            {"$match": {**f, "mode": {"$regex": "^cash$", "$options": "i"}}},
            {"$addFields": {"numeric_amount": {"$convert": {"input": "$amount", "to": "double", "onError": 0.0, "onNull": 0.0}}}},
            {"$group": {"_id": None, "total": {"$sum": "$numeric_amount"}}}
        ]"""
content = content.replace(old_pipeline_1, new_pipeline_1)

old_pipeline_2 = """        bank_in_pipeline = [
            {"$match": {**f, "mode": {"$not": {"$regex": "^cash$", "$options": "i"}}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]"""
new_pipeline_2 = """        bank_in_pipeline = [
            {"$match": {**f, "mode": {"$not": {"$regex": "^cash$", "$options": "i"}}}},
            {"$addFields": {"numeric_amount": {"$convert": {"input": "$amount", "to": "double", "onError": 0.0, "onNull": 0.0}}}},
            {"$group": {"_id": None, "total": {"$sum": "$numeric_amount"}}}
        ]"""
content = content.replace(old_pipeline_2, new_pipeline_2)

old_pipeline_3 = """        cash_out_pipeline = [
            {"$match": {**f, "payment_mode": {"$regex": "^cash$", "$options": "i"}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]"""
new_pipeline_3 = """        cash_out_pipeline = [
            {"$match": {**f, "payment_mode": {"$regex": "^cash$", "$options": "i"}}},
            {"$addFields": {"numeric_amount": {"$convert": {"input": "$amount", "to": "double", "onError": 0.0, "onNull": 0.0}}}},
            {"$group": {"_id": None, "total": {"$sum": "$numeric_amount"}}}
        ]"""
content = content.replace(old_pipeline_3, new_pipeline_3)

old_pipeline_4 = """        bank_out_pipeline = [
            {"$match": {**f, "payment_mode": {"$not": {"$regex": "^cash$", "$options": "i"}}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]"""
new_pipeline_4 = """        bank_out_pipeline = [
            {"$match": {**f, "payment_mode": {"$not": {"$regex": "^cash$", "$options": "i"}}}},
            {"$addFields": {"numeric_amount": {"$convert": {"input": "$amount", "to": "double", "onError": 0.0, "onNull": 0.0}}}},
            {"$group": {"_id": None, "total": {"$sum": "$numeric_amount"}}}
        ]"""
content = content.replace(old_pipeline_4, new_pipeline_4)

with open("../backend/erp_routes.py", "w") as f:
    f.write(content)
