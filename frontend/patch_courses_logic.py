with open("src/lib/erpApi.js", "r") as f:
    content = f.read()

import re

new_constants = """export const STUDENT_CLASSES = [
  "Biggner (8th)",
  "Adapt (9th)",
  "Elivate (10th)",
  "Growth (11th)",
  "Excel (12th)",
  "Conqurer (Dropper)"
];

export const STUDENT_COURSES = [
  "Foundation",
  "IIT JEE",
  "NEET UG"
];

export const getValidCoursesForClass = (className) => {
  if (["Biggner (8th)", "Adapt (9th)", "Elivate (10th)"].includes(className)) {
    return ["Foundation"];
  }
  return ["IIT JEE", "NEET UG"];
};"""

content = re.sub(r'export const STUDENT_CLASSES = \[.*?\];\s*export const STUDENT_COURSES = \[.*?\];', new_constants, content, flags=re.DOTALL)

with open("src/lib/erpApi.js", "w") as f:
    f.write(content)
print("Done adding getValidCoursesForClass to erpApi.js")
