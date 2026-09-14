try:
    from svglib.svglib import svg2rlg
    print("svglib available")
except ImportError:
    print("svglib not available")
