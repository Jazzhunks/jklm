import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { erp, STUDENT_CLASSES, STUDENT_COURSES } from "@/lib/erpApi";
import { Save, X } from "lucide-react";

export default function FeeMatrixConfigModal({ onClose }) {
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    erp.getFeeMatrix().then(res => {
      setMatrix(res.matrix || {});
      setLoading(false);
    }).catch(err => {
      toast.error("Failed to load fee matrix");
      setLoading(false);
    });
  }, []);

  const handleChange = (cls, course, value) => {
    setMatrix(prev => ({
      ...prev,
      [cls]: {
        ...(prev[cls] || {}),
        [course]: Number(value)
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await erp.updateFeeMatrix(matrix);
      toast.success("Fee structure updated successfully");
      onClose();
    } catch (err) {
      toast.error("Failed to save fee structure");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-background border border-border rounded-2xl w-full max-w-4xl p-6 shadow-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-display font-medium text-xl">Global Fee Structure Matrix</h3>
            <p className="text-xs text-muted-foreground mt-1">Preset standard fees. These will auto-populate and lock during admissions.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition"><X size={20}/></button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading matrix...</div>
        ) : (
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Class / Target</th>
                  {STUDENT_COURSES.map(c => (
                    <th key={c} className="px-4 py-3 font-semibold text-center">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {STUDENT_CLASSES.map(cls => (
                  <tr key={cls} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{cls}</td>
                    {STUDENT_COURSES.map(course => (
                      <td key={course} className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <span className="text-muted-foreground">₹</span>
                          <input 
                            type="number"
                            min="0"
                            className="w-24 px-2 py-1.5 border border-border bg-background rounded text-sm text-right focus:outline-none focus:border-accent"
                            value={matrix[cls]?.[course] || ""}
                            onChange={(e) => handleChange(cls, course, e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 font-bold text-muted-foreground hover:text-foreground">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={saving || loading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-primary/90 transition"
          >
            <Save size={14}/> {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
