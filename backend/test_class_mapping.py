def get_class_display(current_class, course):
    c_class = str(current_class).strip().lower()
    c_course = str(course).strip().upper()
    
    is_neet = "NEET" in c_course
    is_iit = "IIT" in c_course or "JEE" in c_course
    suffix = " NEET" if is_neet else (" IIT" if is_iit else "")
    
    if "8" in c_class:
        return "Beginner"
    elif "9" in c_class:
        return "Adapt"
    elif "10" in c_class:
        return "Elevate"
    elif "11" in c_class:
        return f"Growth{suffix}"
    elif "12" in c_class:
        return f"Excel{suffix}"
    elif "drop" in c_class or "13" in c_class:
        return f"Conquer{suffix}"
    
    # Fallback to just returning the course if we can't map the class
    return course if course else current_class

print(get_class_display("8th", "Foundation"))
print(get_class_display("11th", "NEET Target"))
print(get_class_display("Dropper", "IIT JEE Main"))
