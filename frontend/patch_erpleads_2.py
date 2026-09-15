with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

old_card = """                    <div 
                      key={lead.id}
                      className="glass-elevated p-3.5 rounded-xl border border-border hover:border-primary/40 transition group relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-foreground truncate">{lead.name}</h4>"""

new_card = """                    <div 
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="glass-elevated p-3.5 rounded-xl border border-border hover:border-primary/40 cursor-pointer transition group relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-foreground truncate">{lead.name}</h4>"""
content = content.replace(old_card, new_card)

# Fix propagation for buttons
old_whatsapp = 'onClick={() => openWhatsApp(lead)}'
new_whatsapp = 'onClick={(e) => { e.stopPropagation(); openWhatsApp(lead); }}'
content = content.replace(old_whatsapp, new_whatsapp)

old_delete = 'onClick={() => setDeleteModal(lead)}'
new_delete = 'onClick={(e) => { e.stopPropagation(); setDeleteModal(lead); }}'
content = content.replace(old_delete, new_delete)

old_contacted = 'onClick={() => updateStage(lead.id, "contacted")}'
new_contacted = 'onClick={(e) => { e.stopPropagation(); updateStage(lead.id, "contacted"); }}'
content = content.replace(old_contacted, new_contacted)

old_followup = 'onClick={() => updateStage(lead.id, "follow_up")}'
new_followup = 'onClick={(e) => { e.stopPropagation(); updateStage(lead.id, "follow_up"); }}'
content = content.replace(old_followup, new_followup)

# Add badges for temperature and source before `moving_to_class`
old_class = """                      {lead.moving_to_class && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-medium text-foreground">
                            Class: {lead.moving_to_class}
                          </span>
                        </div>
                      )}"""

new_class = """                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {lead.temperature === "hot" && <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-[10px] font-bold">🔥 Hot</span>}
                        {lead.temperature === "warm" && <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[10px] font-bold">☀️ Warm</span>}
                        {lead.temperature === "cold" && <span className="px-1.5 py-0.5 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded text-[10px] font-bold">❄️ Cold</span>}
                        
                        {lead.source && (
                          <span className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {lead.source}
                          </span>
                        )}

                        {lead.moving_to_class && (
                          <span className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded text-[10px] font-medium text-accent">
                            {lead.moving_to_class}
                          </span>
                        )}
                      </div>"""

content = content.replace(old_class, new_class)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done patching cards")
