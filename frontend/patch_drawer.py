with open("src/pages/erp/modals/LeadActivityDrawer.jsx", "r") as f:
    content = f.read()

# State
old_state = """  const [noteType, setNoteType] = useState("call");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);"""

new_state = """  const [noteType, setNoteType] = useState("call");
  const [notes, setNotes] = useState("");
  const [nextFollowup, setNextFollowup] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);"""
content = content.replace(old_state, new_state)

# Mutation call
old_mutate = """    addInteraction.mutate({ type: noteType, notes }, {"""
new_mutate = """    const payload = { type: noteType, notes };
    if (nextFollowup) {
      payload.next_followup_at = new Date(nextFollowup).toISOString();
    }
    addInteraction.mutate(payload, {"""
content = content.replace(old_mutate, new_mutate)

# Add input for nextFollowup in the UI
old_textarea = """            <textarea
              className="w-full bg-background border border-border/50 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[80px]"
              placeholder={`Enter notes for this ${noteType}...`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />"""

new_textarea = """            <textarea
              className="w-full bg-background border border-border/50 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[80px] mb-3"
              placeholder={`Enter notes for this ${noteType}...`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1"><Calendar size={12}/> Schedule Next Follow-up (Optional)</label>
              <input 
                type="datetime-local" 
                value={nextFollowup} 
                onChange={e => setNextFollowup(e.target.value)} 
                className="w-full bg-background border border-border/50 rounded-lg p-2 text-xs focus:ring-1 focus:ring-primary outline-none"
              />
            </div>"""

content = content.replace(old_textarea, new_textarea)

with open("src/pages/erp/modals/LeadActivityDrawer.jsx", "w") as f:
    f.write(content)
print("Done patching drawer")
