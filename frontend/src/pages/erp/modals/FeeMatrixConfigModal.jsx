import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { erp } from "@/lib/erpApi";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";

export default function FeeMatrixConfigModal({ onClose }) {
  const { academicConfig, refreshAcademicConfig } = useOutletContext();
  
  const [matrix, setMatrix] = useState((academicConfig.matrix && academicConfig.matrix.matrix) ? academicConfig.matrix.matrix : (academicConfig.matrix || {}));
  const [classes, setClasses] = useState(academicConfig.classes || []);
  const [courses, setCourses] = useState(academicConfig.courses || []);
  const [saving, setSaving] = useState(false);
  
  const [newClass, setNewClass] = useState("");
  const [newCourse, setNewCourse] = useState("");

  const handleChange = (cls, course, value) => {
    setMatrix(prev => ({
      ...prev,
      [cls]: {
        ...(prev[cls] || {}),
        [course]: Number(value)
      }
    }));
  };
  
  const addClass = () => {
    if (!newClass.trim() || classes.includes(newClass.trim())) return;
    setClasses([...classes, newClass.trim()]);
    setNewClass("");
  };
  
  const removeClass = (c) => {
    setClasses(classes.filter(x => x !== c));
  };
  
  const addCourse = () => {
    if (!newCourse.trim() || courses.includes(newCourse.trim())) return;
    setCourses([...courses, newCourse.trim()]);
    setNewCourse("");
  };
  
  const removeCourse = (c) => {
    setCourses(courses.filter(x => x !== c));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await erp.updateFeeMatrix({ matrix, classes, courses });
      await refreshAcademicConfig();
      toast.success("Academic Architecture Updated Successfully");
      onClose();
    } catch (err) {
      toast.error("Failed to save architecture");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] shadow-2xl rounded-[1.5rem] overflow-hidden w-full max-w-5xl p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Academic Architecture Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Configure valid target classes, available courses, and the cross-reference tuition fees.</p>
          </div>
          <Button onClick={onClose} className="bg-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200 transition"><X size={20}/></Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-black/50 p-4 rounded-xl border border-slate-200 dark:border-white/[0.08]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3">Target Classes</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                    {classes.map(c => (
                        <div key={c} className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] px-2 py-1 rounded-md text-xs text-slate-700 dark:text-zinc-300">
                            {c}
                            <button onClick={() => removeClass(c)} className="text-rose-500 hover:text-rose-600 ml-1"><Trash2 size={12}/></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input type="text" value={newClass} onChange={e => setNewClass(e.target.value)} onKeyDown={e => e.key === 'Enter' && addClass()} placeholder="e.g. 10th Standard" className="flex-1 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-lg text-xs px-3 py-1.5 focus:border-teal-600/50 outline-none" />
                    <Button onClick={addClass} className="bg-teal-600 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase"><Plus size={14}/></Button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-black/50 p-4 rounded-xl border border-slate-200 dark:border-white/[0.08]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3">Available Courses</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                    {courses.map(c => (
                        <div key={c} className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] px-2 py-1 rounded-md text-xs text-slate-700 dark:text-zinc-300">
                            {c}
                            <button onClick={() => removeCourse(c)} className="text-rose-500 hover:text-rose-600 ml-1"><Trash2 size={12}/></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input type="text" value={newCourse} onChange={e => setNewCourse(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCourse()} placeholder="e.g. Crash Course" className="flex-1 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/[0.08] rounded-lg text-xs px-3 py-1.5 focus:border-teal-600/50 outline-none" />
                    <Button onClick={addCourse} className="bg-teal-600 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase"><Plus size={14}/></Button>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-white/[0.08] rounded-xl bg-white dark:bg-black/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-200/50 dark:bg-white/[0.04]/50 border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">Class \ Course</th>
                {courses.map(c => (
                  <th key={c} className="px-4 py-3 font-semibold text-center whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.08]">
              {classes.map(cls => (
                <tr key={cls} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{cls}</td>
                  {courses.map(course => (
                    <td key={course} className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-slate-400 dark:text-zinc-600">₹</span>
                        <input 
                          type="number"
                          min="0"
                          className="w-24 bg-slate-100 dark:bg-[#080808] border border-slate-200 dark:border-white/[0.08] rounded-lg text-[12px] text-slate-800 dark:text-zinc-200 focus:border-teal-600/50 px-2 py-1.5 text-right font-mono"
                          value={matrix[cls]?.[course] || ""}
                          onChange={(e) => handleChange(cls, course, e.target.value)}
                          placeholder="-"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/[0.08]">
          <Button onClick={onClose} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 px-6 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300">Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-teal-600 text-white rounded-full px-8 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-md hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Save size={14}/> {saving ? "Deploying..." : "Deploy Config"}
          </Button>
        </div>
      </div>
    </div>
  , document.body);
}
