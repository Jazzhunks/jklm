with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    lines = f.readlines()

# Find the exact start and end lines of the return block
start = None
end = None
for i, line in enumerate(lines):
    if i >= 265 and "return (" in line and start is None:
        start = i
    if start and i > start and line.strip() == "}" and end is None:
        # Look for the closing of the export default function
        # It should be a lone } at a low indentation
        if not line.startswith("  "):
            end = i
            break

print(f"Found return block: lines {start+1} to {end+1}")
