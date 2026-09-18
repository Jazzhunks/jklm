import re

with open("frontend/src/App.js", "r") as f:
    text = f.read()

# Make sure Loader2 is imported
if "import { Loader2 }" not in text:
    text = text.replace('import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";', 
                        'import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";\nimport { Loader2 } from "lucide-react";')

old_suspense = '<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-muted-foreground">Loading…</div></div>}>'

new_suspense = '<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground/50" /></div>}>'

text = text.replace(old_suspense, new_suspense)

with open("frontend/src/App.js", "w") as f:
    f.write(text)

