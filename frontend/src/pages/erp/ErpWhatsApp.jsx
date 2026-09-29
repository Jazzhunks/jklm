import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { waAPI } from "@/lib/api";
import { useBroadcastUpload } from "@/hooks/useBroadcastUpload";
import { useWAAnalyticsStream } from "@/lib/waAnalyticsStream";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { MessageSquare, Plus, Send, Upload, Play, BarChart3, FileSpreadsheet, Loader2, RefreshCw, LayoutTemplate } from "lucide-react";
import TemplateMapper from "@/components/wa/TemplateMapper";
import BroadcastProgress from "@/components/wa/BroadcastProgress";
import AnalyticsCharts from "@/components/wa/AnalyticsCharts";

const TABS = [
  { id: "campaigns", label: "Campaigns", icon: MessageSquare },
  { id: "new", label: "New Broadcast", icon: Plus },
  { id: "quick-replies", label: "Quick Replies", icon: MessageSquare },
  { id: "monitor", label: "Live Monitor", icon: Play },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
];

const TARGET_GROUPS = [
  { value: "leads", label: "CRM Leads" },
  { value: "students", label: "ERP Students" },
  { value: "applicants", label: "Scholarship Applicants" },
  { value: "external", label: "External Upload Only" },
  { value: "all", label: "All CRM Segments" },
];

const EMPTY_CAMPAIGN = {
  name: "",
  template_name: "",
  template_language: "en_US",
  template_components: null,
  target_group: "leads",
  branch_id: "",
  variable_defaults: {},
  variable_mappings: {},
  external_contact_job_id: null,
};

export default function ErpWhatsApp() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [excelColumns, setExcelColumns] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [form, setForm] = useState(EMPTY_CAMPAIGN);
  const [loading, setLoading] = useState(false);
  const [monitorJobId, setMonitorJobId] = useState(null);
  const [monitorJobStatus, setMonitorJobStatus] = useState(null);
  const [analyticsCampaignId, setAnalyticsCampaignId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const [qrForm, setQrForm] = useState({ shortcut: "", text: "", category: "general" });
  const [qrLoading, setQrLoading] = useState(false);
  const { upload: uploadContacts, uploading: uploadingContacts } = useBroadcastUpload();

  const refreshCampaigns = async () => {
    try {
      const { data } = await waAPI.listCampaigns();
      setCampaigns(data || []);
    } catch (e) {
      // silent
    }
  };

  const refreshTemplates = async () => {
    try {
      const { data } = await waAPI.listTemplates();
      setTemplates(data.data || []);
    } catch (e) {
      // silent
    }
  };

  const refreshQuickReplies = async () => {
    try {
      const { data } = await waAPI.listQuickReplies();
      setQuickReplies(data || []);
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    refreshCampaigns();
    refreshTemplates();
    refreshQuickReplies();
  }, []);

  const handleTemplateChange = async (name) => {
    setSelectedTemplate(name);
    setForm((f) => ({ ...f, template_name: name, template_components: null }));
    setUploadResult(null);
    setExcelColumns([]);
    setPreviewRows([]);
  };

  const handleFileUpload = async (file) => {
    const result = await uploadContacts(file);
    setUploadResult(result);
    if (result?.contacts_imported > 0) {
      setForm((f) => ({ ...f, external_contact_job_id: result.job_id }));
    }
    return result;
  };

  const handleCreateCampaign = async () => {
    if (!form.template_name && !form.template_components) {
      toast.error("Please select a template");
      return;
    }
    if (form.target_group === "external" && !form.external_contact_job_id) {
      toast.error("Please upload an Excel file for external targeting");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        variable_mappings: form.variable_mappings || {},
        variable_defaults: form.variable_defaults || {},
      };
      const { data } = await waAPI.createCampaign(payload);
      setForm((f) => ({ ...f, ...EMPTY_CAMPAIGN, template_components: f.template_components }));
      setSelectedTemplate(null);
      setUploadResult(null);
      setExcelColumns([]);
      setPreviewRows([]);
      toast.success("Campaign created");
      setActiveTab("campaigns");
      refreshCampaigns();
    } catch (e) {
      toast.error(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const { data } = await waAPI.sendCampaign(campaignId);
      toast.success("Broadcast started");
      setMonitorJobId(data.job_id);
      setActiveTab("monitor");
    } catch (e) {
      toast.error(e.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalytics = async (campaignId) => {
    setAnalyticsCampaignId(campaignId);
    setActiveTab("analytics");
    try {
      const { data } = await waAPI.getCampaignAnalytics(campaignId);
      setAnalytics(data);
    } catch (e) {
      toast.error("Failed to load analytics");
    }
  };

  const handleCreateQR = async () => {
    if (!qrForm.text.trim()) return toast.error("Quick reply text is required");
    setQrLoading(true);
    try {
      await waAPI.createQuickReply(qrForm);
      setQrForm({ shortcut: "", text: "", category: "general" });
      toast.success("Quick reply saved");
      refreshQuickReplies();
    } catch (e) {
      toast.error(e.response?.data?.detail || e.message);
    } finally {
      setQrLoading(false);
    }
  };

  const handleDeleteQR = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Quick Reply?")) return;
    await waAPI.deleteQuickReply(id);
    setQuickReplies((prev) => prev.filter((q) => q.id !== id));
    toast.success("Deleted");
  };

  const handleJobEvent = (event) => {
    if (event.type === "job_update" || event.type === "job_complete") {
      setMonitorJobStatus(event.data);
    }
  };

  useWAAnalyticsStream(monitorJobId, handleJobEvent);

  useEffect(() => {
    if (monitorJobId && !monitorJobStatus) {
      const interval = setInterval(async () => {
        try {
          const { data } = await waAPI.getCampaign(monitorJobId);
          if (data?.latest_job) {
            setMonitorJobStatus(data.latest_job);
          }
        } catch (e) {
          // ignore
        }
      }, 2000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitorJobId]);

  useEffect(() => {
    if (analyticsCampaignId && !analytics) {
      const interval = setInterval(async () => {
        try {
          const { data } = await waAPI.getCampaignAnalytics(analyticsCampaignId);
          setAnalytics(data);
        } catch (e) {
          // ignore
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [analyticsCampaignId, analytics]);

  const selectedTemplateData = useMemo(
    () => templates.find((t) => t.name === selectedTemplate),
    [templates, selectedTemplate]
  );

  const templateVariables = useMemo(() => {
    if (!selectedTemplateData?.components) return [];
    const vars = [];
    const seen = new Set();
    for (const comp of selectedTemplateData.components || []) {
      if (comp.type !== "BODY") continue;
      const text = comp.text || "";
      for (const m of text.matchAll(/\{\{(\d+)\}\}/g)) {
        const idx = m[1];
        if (seen.has(idx)) continue;
        seen.add(idx);
        vars.push({ index: idx });
      }
    }
    return vars.sort((a, b) => Number(a.index) - Number(b.index));
  }, [selectedTemplateData]);

  return (
    <div className="space-y-6 animate-fadeIn bg-slate-50 dark:bg-black">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase bg-teal-600/10 text-teal-600 border border-teal-600/25 mb-3">Communications</div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-slate-900 dark:text-zinc-100">WhatsApp Broadcast</h1>
          <p className="text-[13px] text-slate-400 dark:text-zinc-600 mt-1.5">Design, deploy, and monitor template-driven broadcasts across CRM and external lists.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-white/[0.08]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-teal-600 text-white border-b-2 border-accent"
                  : "bg-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04]/40"
              }`}
            >
              <Icon size={16} /> {tab.label}
            </Button>
          );
        })}
      </div>

      {activeTab === "campaigns" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-display font-medium text-lg text-slate-800 dark:text-zinc-200">Active Campaigns</h3>
            <Button size="sm" onClick={() => setActiveTab("new")} className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2 cursor-pointer">
              <Plus size={14} className="mr-1.5" /> New Campaign
            </Button>
          </div>
          {campaigns.length === 0 ? (
            <Card className="bg-white dark:bg-[#111] p-8 text-center text-slate-500 dark:text-zinc-400 rounded-2xl border border-slate-200 dark:border-white/[0.08]">
              No campaigns yet. Create your first broadcast to get started.
            </Card>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <Card key={c.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 dark:text-zinc-200 text-sm sm:text-base truncate">{c.name || c.template_name}</div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Template: <span className="font-mono">{c.template_name}</span> · Status:{" "}
                        <span className="uppercase tracking-wider font-bold">{c.status}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Target: {c.target_group} {c.branch_id ? `· Branch: ${c.branch_id}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewAnalytics(c.id)}
                        className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <BarChart3 size={14} className="mr-1.5" /> Analytics
                      </Button>
                      {c.status !== "processing" && c.status !== "completed" && (
                        <Button
                          size="sm"
                          onClick={() => handleSendCampaign(c.id)}
                          disabled={loading}
                          className="rounded-xl text-xs font-bold bg-[#25D366] text-black hover:brightness-110 cursor-pointer"
                        >
                          <Send size={14} className="mr-1.5" /> Send
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "new" && (
        <div className="space-y-6 animate-fadeIn bg-slate-50 dark:bg-black">
          <Card className="p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/30 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wider font-bold">Campaign Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. October Lead Blast"
                  className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wider font-bold">Template</Label>
                <Select value={form.template_name} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50">
                    <SelectValue placeholder="Select approved template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.name} value={t.name}>
                        {t.name} ({t.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wider font-bold">Target Group</Label>
                <Select
                  value={form.target_group}
                  onValueChange={(val) => setForm((f) => ({ ...f, target_group: val }))}
                >
                  <SelectTrigger className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_GROUPS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wider font-bold">Branch (optional)</Label>
                <Input
                  value={form.branch_id}
                  onChange={(e) => setForm((f) => ({ ...f, branch_id: e.target.value }))}
                  placeholder="Branch ID"
                  className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
                />
              </div>
            </div>

            {form.target_group === "external" && (
              <div className="space-y-3 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.08] bg-slate-200/50 dark:bg-white/[0.04]/20">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-zinc-200">
                  <Upload size={16} /> External Contact Upload
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Upload an Excel/CSV file with at least a phone column. Duplicates within the file will be
                  skipped with a warning. Numbers already in the database will still receive this broadcast.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    disabled={uploadingContacts}
                    className="block text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-600/90"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        const blob = await waAPI.downloadUploadTemplate();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "wa_upload_template.xlsx";
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("Template downloaded");
                      } catch (e) {
                        toast.error("Failed to download template");
                      }
                    }}
                    className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet size={14} className="mr-1.5" /> Download Template
                  </Button>
                </div>
                {uploadResult && (
                  <div className="text-xs text-slate-500 dark:text-zinc-400 space-y-1">
                    <div>Imported: {uploadResult.contacts_imported} contacts</div>
                    {uploadResult.warnings?.length > 0 && (
                      <div className="text-amber-600">Warnings: {uploadResult.warnings.length}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedTemplateData && (
              <div className="space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/20">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-zinc-200">
                  <Template size={16} /> Variable Mapping
                </div>
                <TemplateMapper
                  templateName={selectedTemplate}
                  templateComponents={selectedTemplateData.components}
                  excelColumns={excelColumns}
                  variableMappings={form.variable_mappings}
                  onMappingsChange={(m) => setForm((f) => ({ ...f, variable_mappings: m }))}
                  variableDefaults={form.variable_defaults}
                  onDefaultsChange={(d) => setForm((f) => ({ ...f, variable_defaults: d }))}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleCreateCampaign}
                disabled={loading}
                className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : <Plus size={14} className="mr-2" />}
                Create Campaign
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "quick-replies" && (
        <div className="space-y-4 animate-fadeIn">
          <Card className="p-5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/30 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                value={qrForm.shortcut}
                onChange={(e) => setQrForm((f) => ({ ...f, shortcut: e.target.value }))}
                placeholder="Shortcut / label"
                className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
              />
              <Input
                value={qrForm.text}
                onChange={(e) => setQrForm((f) => ({ ...f, text: e.target.value }))}
                placeholder="Reply text"
                className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
              />
              <Input
                value={qrForm.category}
                onChange={(e) => setQrForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Category"
                className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50"
              />
            </div>
            <Button onClick={handleCreateQR} disabled={qrLoading} className="bg-teal-600 text-white rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.04em] uppercase shadow-[0_0_0_1px_rgba(13,148,136,0.5),0_4px_16px_rgba(13,148,136,0.25)] hover:bg-teal-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2 cursor-pointer">
              {qrLoading ? "Saving..." : "Save Quick Reply"}
            </Button>
          </Card>
          <div className="space-y-2">
            {quickReplies.map((q) => (
              <Card key={q.id} className="p-3 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/40 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">{q.shortcut || q.category}</div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{q.text}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteQR(q.id)}
                  className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-rose-500 hover:border-slate-300 dark:border-white/20 hover:text-rose-800 dark:text-rose-400 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
                >
                  Delete
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "monitor" && (
        <div className="space-y-4 animate-fadeIn">
          {!monitorJobId ? (
            <Card className="bg-white dark:bg-[#111] p-8 text-center text-slate-500 dark:text-zinc-400 rounded-2xl border border-slate-200 dark:border-white/[0.08]">
              Start a broadcast from the Campaigns tab to see live progress here.
            </Card>
          ) : (
            <BroadcastProgress jobStatus={monitorJobStatus} />
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Label className="text-xs uppercase tracking-wider font-bold">Select Campaign</Label>
            <Select value={analyticsCampaignId || ""} onValueChange={handleViewAnalytics}>
              <SelectTrigger className="w-64 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.08] rounded-[10px] text-[13px] text-slate-600 dark:text-zinc-400 px-3 py-2 focus:outline-none focus:border-teal-600/50">
                <SelectValue placeholder="Choose campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name || c.template_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => setAnalytics(null)} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2 cursor-pointer">
              <RefreshCw size={14} className="mr-1.5" /> Refresh
            </Button>
          </div>
          {analytics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms]">
                  <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">Total</div>
                  <div className="text-2xl font-bold">{analytics.total_messages || 0}</div>
                </Card>
                <Card className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms]">
                  <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">Delivered</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {analytics.by_status?.delivered || 0}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">{analytics.delivery_rate}%</div>
                </Card>
                <Card className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms]">
                  <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">Read</div>
                  <div className="text-2xl font-bold text-blue-600">{analytics.by_status?.read || 0}</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">{analytics.read_rate}%</div>
                </Card>
                <Card className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/[0.07] rounded-[16px] p-5 hover:border-teal-600/30 hover:-translate-y-[1px] transition-all duration-[350ms]">
                  <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-slate-500 dark:text-zinc-400">Failed</div>
                  <div className="text-2xl font-bold text-rose-600">{analytics.by_status?.failed || 0}</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">{analytics.fail_rate}%</div>
                </Card>
              </div>
              <AnalyticsCharts analytics={analytics} />
            </div>
          ) : (
            <Card className="bg-white dark:bg-[#111] p-8 text-center text-slate-500 dark:text-zinc-400 rounded-2xl border border-slate-200 dark:border-white/[0.08]">
              Select a campaign to view analytics.
            </Card>
          )}
        </div>
      )}

      {activeTab === "templates" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-medium text-lg text-slate-800 dark:text-zinc-200">Approved Meta Templates</h3>
            <Button size="sm" variant="outline" onClick={refreshTemplates} className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2 cursor-pointer">
              <RefreshCw size={14} className="mr-1.5" /> Refresh
            </Button>
          </div>
          {templates.length === 0 ? (
            <Card className="bg-white dark:bg-[#111] p-8 text-center text-slate-500 dark:text-zinc-400 rounded-2xl border border-slate-200 dark:border-white/[0.08]">
              No approved templates found. Submit templates via Meta Business Manager first.
            </Card>
          ) : (
            <div className="space-y-3">
              {templates.map((t) => (
                <Card key={t.name} className="p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-zinc-200 text-sm">{t.name}</div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Language: {t.language} · Category: {t.category}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(t.name);
                          setActiveTab("new");
                        }}
                        className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
                      >
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const phone = prompt("Enter phone number to send preview to:");
                          if (!phone) return;
                          waAPI.previewTemplate(t.name, { to: phone }).then(() => toast.success("Preview sent")).catch((e) => toast.error(e.response?.data?.detail || e.message));
                        }}
                        className="bg-transparent rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-800 dark:text-zinc-200 hover:bg-slate-200/50 dark:bg-white/[0.04] px-4 py-2 text-[11px] font-semibold tracking-[0.06em] uppercase transition-all duration-300 inline-flex items-center gap-2 cursor-pointer"
                      >
                        Send Test
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
