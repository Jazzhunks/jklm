with open("src/pages/erp/ErpAttendance.jsx", "r") as f:
    content = f.read()

import re

old_import = """import { 
  QrCode, Users, Clock, ShieldAlert, Wifi, WifiOff, FileDown,
  Terminal, Search, UserCheck, CheckCircle2, AlertCircle, Volume2, VolumeX, User
} from "lucide-react";"""

new_import = """import { 
  QrCode, Users, Clock, ShieldAlert, Wifi, WifiOff, FileDown,
  Terminal, Search, UserCheck, CheckCircle2, AlertCircle, Volume2, VolumeX, User, X
} from "lucide-react";"""

content = content.replace(old_import, new_import)

with open("src/pages/erp/ErpAttendance.jsx", "w") as f:
    f.write(content)
