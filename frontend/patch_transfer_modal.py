with open("src/pages/erp/modals/LeadTransferModal.jsx", "r") as f:
    content = f.read()

import_query = 'import { useMutation, useQueryClient'
new_import_query = 'import { useMutation, useQueryClient, useQuery'
content = content.replace(import_query, new_import_query)

branches_query = """  const queryClient = useQueryClient();
  const [form, setForm] = useState({ branch_id: "", notes: "" });"""

new_branches_query = """  const queryClient = useQueryClient();
  const [form, setForm] = useState({ branch_id: "", notes: "" });
  
  const { data: fetchBranches = [] } = useQuery({
    queryKey: ['erp-branches-all'],
    queryFn: erp.listBranches,
    enabled: !branches || branches.length === 0
  });
  
  const activeBranches = branches?.length > 0 ? branches : fetchBranches;"""

content = content.replace(branches_query, new_branches_query)

map_branches = """          {branches.map(b => ("""
new_map_branches = """          {activeBranches.map(b => ("""
content = content.replace(map_branches, new_map_branches)

with open("src/pages/erp/modals/LeadTransferModal.jsx", "w") as f:
    f.write(content)
print("Done patching LeadTransferModal")
