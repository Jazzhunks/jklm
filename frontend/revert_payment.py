with open("src/pages/erp/ErpStudentDetail.jsx", "r") as f:
    content = f.read()

# Remove pine_labs_edc from select
old_select = """                <option value="pine_labs_edc">Pine Labs EDC (Cloud)</option>
              </select>"""
new_select = """              </select>"""
content = content.replace(old_select, new_select)

# Revert the submit logic
import re

submit_regex = re.compile(r'      const payment = await erp\.createPayment\(\{.*?if \(form\.mode === "pine_labs_edc"\) \{.*?return; // Don\'t call onCreated immediately\s*\}\s*onCreated\(\);\s*\} catch \(err\) \{', re.DOTALL)

new_submit = """      await erp.createPayment({
        student_id: studentId,
        amount: entryAmount,
        mode: form.mode,
        apply_gst: form.apply_gst,
        next_due_date: form.next_due_date || null,
        notes: form.notes || null,
        transaction_ref: form.transaction_ref || undefined,
      });
      onCreated();
    } catch (err) {"""

content = submit_regex.sub(new_submit, content)

with open("src/pages/erp/ErpStudentDetail.jsx", "w") as f:
    f.write(content)
print("Done reverting submit logic")
