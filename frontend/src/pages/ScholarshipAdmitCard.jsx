import { useState } from "react";
import { toast } from "sonner";
import { api, formatError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHero from "@/components/PageHero";
import { Download } from "lucide-react";

export default function ScholarshipAdmitCard() {
  const [lookup, setLookup] = useState({ phone: "", application_no: "" });
  const [appData, setAppData] = useState(null);
  const [busyLookup, setBusyLookup] = useState(false);

  const doLookup = async (e) => {
    e.preventDefault();
    setBusyLookup(true); setAppData(null);
    try {
      const { data } = await api.post("/scholarship-applications/lookup", lookup);
      setAppData(data);
      toast.success("Application found.");
    } catch (err) {
      toast.error(formatError(err.response?.data?.detail) || "Could not retrieve application. Check your details.");
    } finally { setBusyLookup(false); }
  };

  return (
    <div data-testid="scholarship-admit-card-page">
      <PageHero
        eyebrow="Admit Card Portal"
        title="Download"
        accent="Admit Card"
        subtitle="Enter your application number and registered phone number to securely download your admit card."
      />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-24 -mt-8">
        <div className="mt-12 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <form onSubmit={doLookup} className="border border-border p-6 rounded-md bg-background space-y-3">
              <h3 className="font-display text-xl font-bold">Find Your Application</h3>
              <p className="text-sm text-muted-foreground">Enter the exact application number and the 10-digit phone number you registered with.</p>
              <Input placeholder="Application number (e.g. 12345678)" value={lookup.application_no} onChange={e => setLookup({...lookup, application_no: e.target.value})} required data-testid="lookup-appno" />
              <Input placeholder="Phone (10-digit)" value={lookup.phone} onChange={e => setLookup({...lookup, phone: e.target.value})} required data-testid="lookup-phone" />
              <Button type="submit" disabled={busyLookup} className="w-full bg-primary text-primary-foreground h-11" data-testid="lookup-submit">{busyLookup ? "Searching…" : "Retrieve Application"}</Button>
            </form>
          </div>
          <div className="lg:col-span-7">
            {!appData && <div className="border border-dashed border-border rounded-md p-8 text-center text-muted-foreground">Submit the form to retrieve your admit card.</div>}
            
            {appData && (
              <div className="border border-border p-8 rounded-md bg-background shadow-sm space-y-5" data-testid="admit-card-result">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Application Found</div>
                  <h3 className="font-display text-3xl font-black mt-1">{appData.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">{appData.application_no} · {appData.scholarship_title || appData.target_exam || "Scholarship Test"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 border border-border rounded-md p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Standard</div>
                    <div className="font-display text-xl font-bold mt-1">{appData.standard}</div>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-md p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Venue</div>
                    <div className="font-display text-xl font-bold mt-1">{appData.venue || "TBA"}</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <a href={`/admt/${appData.application_no}?phone=${encodeURIComponent(appData.phone || lookup.phone)}`} target="_blank" rel="noreferrer" data-testid="download-admit-btn">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-12 flex items-center gap-2">
                      <Download size={18} /> Download Admit Card PDF
                    </Button>
                  </a>
                  <p className="text-xs text-center text-muted-foreground mt-3">Please save this document and bring it with you to the test center.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
