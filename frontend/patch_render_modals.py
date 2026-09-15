with open("src/pages/erp/ErpLeads.jsx", "r") as f:
    content = f.read()

injection = """
      {/* Enterprise CRM Modals */}
      {selectedLead && <LeadActivityDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />}
      {proposeModalLead && <LeadProposeModal lead={proposeModalLead} onClose={() => setProposeModalLead(null)} />}
      {reviewModalLead && <LeadReviewModal lead={reviewModalLead} onClose={() => setReviewModalLead(null)} />}
      {enrollModalLead && <LeadEnrollModal lead={enrollModalLead} onClose={() => setEnrollModalLead(null)} />}
      {transferModalLead && <LeadTransferModal lead={transferModalLead} branches={branches} onClose={() => setTransferModalLead(null)} />}"""

content = content.replace("""      {/* Enterprise CRM Modals */}
      {proposeModalLead && <LeadProposeModal lead={proposeModalLead} onClose={() => setProposeModalLead(null)} />}
      {reviewModalLead && <LeadReviewModal lead={reviewModalLead} onClose={() => setReviewModalLead(null)} />}
      {enrollModalLead && <LeadEnrollModal lead={enrollModalLead} onClose={() => setEnrollModalLead(null)} />}
      {transferModalLead && <LeadTransferModal lead={transferModalLead} branches={branches} onClose={() => setTransferModalLead(null)} />}""", injection)

with open("src/pages/erp/ErpLeads.jsx", "w") as f:
    f.write(content)
print("Done injecting LeadActivityDrawer")
