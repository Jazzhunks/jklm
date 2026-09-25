import os
import re

with open('server.py', 'r') as f:
    lines = f.readlines()

def get_lines(start_str, end_str=None):
    start_idx, end_idx = -1, -1
    for i, l in enumerate(lines):
        if l.startswith(start_str):
            start_idx = i
            break
    if start_idx == -1: return []
    if end_str is None:
        return lines[start_idx:]
    for i in range(start_idx+1, len(lines)):
        if l.startswith(end_str):
            end_idx = i
            break
    if end_idx == -1: return lines[start_idx:]
    return lines[start_idx:end_idx]

