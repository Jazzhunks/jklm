import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import GlassPanel from "@/components/GlassPanel";
import CourseCard3D from "@/components/CourseCard3D";
import { CTAPrimary, CTAGhost, Eyebrow, Reveal } from "@/components/Cinematic";
import { AnimatedCounter } from "@/components/Metrics";
import { api } from "@/lib/api";
import { isReactSnap } from "@/utils/isBot";
import { Helmet } from "react-helmet-async";
import {
  Star, Sparkle, Trophy, GraduationCap, Lightning, Compass,
  ShieldCheck, ChartLineUp, Quotes, MapPin, ArrowUpRight, Clock
} from "@phosphor-icons/react";

const EASE = [0.16, 1, 0.3, 1];

export default function Home() {
  const isMobile = useIsMobile();
  const isBot = isReactSnap(); 
  
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ students_trained: 1323, selections: 100, educators: 100, centers: 5 });
  const [results, setResults] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [centers, setCenters] = useState([]);
  
  // WATH State
  const [wathPage, setWathPage] = useState(null);
  const [wathLoading, setWathLoading] = useState(true);

  useEffect(() => {
    const toList = (d) => (Array.isArray(d) ? d : d?.items || []);
    Promise.all([
      api.get("/courses?featured=true").then(r => setCourses(toList(r.data))).catch(()=>{}),
      api.get("/stats").then(r => {
        // Destructure 'centers' out so the backend stats can NEVER overwrite it
        const { centers: _, ...statsWithoutCenters } = r.data || {};
        setStats(prev => ({ ...prev, ...statsWithoutCenters }));
      }).catch(()=>{}),
      api.get("/results").then(r => setResults(toList(r.data).slice(0, 6))).catch(()=>{}),
      api.get("/testimonials").then(r => setTestimonials(toList(r.data))).catch(()=>{}),
      api.get("/centers").then(r => {
        const list = toList(r.data);
        setCenters(list);
        // Explicitly set the accurate count from the array length
        setStats(prev => ({ ...prev, centers: list.length }));
      }).catch(()=>{}),
      api.get("/wath/page")
         .then(r => setWathPage(r.data))
         .catch(()=>{})
         .finally(() => setWathLoading(false)),
    ]);
  }, []);

  return (
    <div data-testid="home-page" className="w-full bg-[#f1f3f9] text-[#4a5568] font-sans selection:bg-rose-200">
      
      {/* CLAY HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-rose-400 text-xs font-bold uppercase tracking-widest shadow-[6px_6px_12px_#d1d5df,-6px_-6px_12px_#ffffff,inset_-2px_-2px_4px_rgba(0,0,0,0.02),inset_2px_2px_4px_rgba(255,255,255,1)]">
              <Sparkle weight="fill" size={14} /> Authorised Unacademy Franchise
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-700 leading-tight tracking-tight">
              Defy the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-rose-400 to-orange-400">Ordinary.</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-md leading-relaxed">
              A next-generation learning ecosystem for NEET, IIT-JEE, and CBSE — taught by India's finest educators in Kashmir.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/enroll" className="px-8 py-4 rounded-2xl bg-rose-400 text-white font-bold text-center shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.15),inset_4px_4px_8px_rgba(255,255,255,0.4),8px_8px_16px_#d1d5df,-8px_-8px_16px_#ffffff] hover:-translate-y-1 transition-transform">
                Enroll Now
              </Link>
              <Link to="/scholarship" className="px-8 py-4 rounded-2xl bg-white text-slate-600 font-bold text-center shadow-[8px_8px_16px_#d1d5df,-8px_-8px_16px_#ffffff,inset_-4px_-4px_8px_rgba(0,0,0,0.02),inset_4px_4px_8px_rgba(255,255,255,1)] hover:-translate-y-1 transition-transform">
                Apply for Scholarship
              </Link>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-2 gap-6">
             <div className="p-8 rounded-[2.5rem] bg-white flex flex-col items-center justify-center text-center shadow-[16px_16px_32px_#d1d5df,-16px_-16px_32px_#ffffff,inset_-6px_-6px_12px_rgba(0,0,0,0.03),inset_6px_6px_12px_rgba(255,255,255,1)] hover:scale-105 transition-transform aspect-square">
                <div className="text-rose-400 mb-2"><Trophy size={40} weight="duotone" /></div>
                <div className="text-3xl font-black text-slate-700">100+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Selections</div>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-white flex flex-col items-center justify-center text-center shadow-[16px_16px_32px_#d1d5df,-16px_-16px_32px_#ffffff,inset_-6px_-6px_12px_rgba(0,0,0,0.03),inset_6px_6px_12px_rgba(255,255,255,1)] hover:scale-105 transition-transform aspect-square translate-y-8">
                <div className="text-orange-400 mb-2"><GraduationCap size={40} weight="duotone" /></div>
                <div className="text-3xl font-black text-slate-700">1.3k+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Students</div>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-white flex flex-col items-center justify-center text-center shadow-[16px_16px_32px_#d1d5df,-16px_-16px_32px_#ffffff,inset_-6px_-6px_12px_rgba(0,0,0,0.03),inset_6px_6px_12px_rgba(255,255,255,1)] hover:scale-105 transition-transform aspect-square -translate-y-8">
                <div className="text-blue-400 mb-2"><Star size={40} weight="duotone" /></div>
                <div className="text-3xl font-black text-slate-700">100+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Educators</div>
             </div>
             <div className="p-8 rounded-[2.5rem] bg-white flex flex-col items-center justify-center text-center shadow-[16px_16px_32px_#d1d5df,-16px_-16px_32px_#ffffff,inset_-6px_-6px_12px_rgba(0,0,0,0.03),inset_6px_6px_12px_rgba(255,255,255,1)] hover:scale-105 transition-transform aspect-square">
                <div className="text-emerald-400 mb-2"><MapPin size={40} weight="duotone" /></div>
                <div className="text-3xl font-black text-slate-700">5</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Centers</div>
             </div>
          </div>
        </div>
      </section>

      {/* CLAY SCHOLARSHIP BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
         <div className="w-full rounded-[3rem] bg-rose-400 p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between shadow-[inset_-8px_-8px_16px_rgba(0,0,0,0.1),inset_8px_8px_16px_rgba(255,255,255,0.3),20px_20px_40px_#d1d5df,-20px_-20px_40px_#ffffff]">
            <div className="text-white space-y-4 mb-8 md:mb-0">
               <h2 className="text-4xl font-black tracking-tight">Up to 100% off</h2>
               <p className="font-medium text-rose-100 max-w-sm">Take our nationwide scholarship test and secure your future with India's top educators.</p>
            </div>
            <Link to="/scholarship" className="px-8 py-4 rounded-2xl bg-white text-rose-500 font-black text-center shadow-[8px_8px_16px_rgba(225,29,72,0.3),-8px_-8px_16px_rgba(255,255,255,0.2),inset_-4px_-4px_8px_rgba(0,0,0,0.05),inset_4px_4px_8px_rgba(255,255,255,1)] hover:scale-105 transition-transform">
              Apply Now
            </Link>
         </div>
      </section>

      {/* CLAY METHODOLOGY / COURSES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
           <h2 className="text-4xl font-black text-slate-700">The Northend Way</h2>
           <p className="text-slate-500 font-medium mt-4">Pioneering pedagogy with modern technology.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
           {[
             {t: "Curated Batches", d: "Small sizes for personalized attention", i: ShieldCheck},
             {t: "Expert Faculty", d: "Learn from the best in the industry", i: Lightning},
             {t: "Daily Practice", d: "Rigorous testing and assessment", i: ChartLineUp},
           ].map((item, i) => (
             <div key={i} className="p-8 rounded-[2.5rem] bg-[#f5f7fa] flex flex-col items-center text-center shadow-[16px_16px_32px_#d1d5df,-16px_-16px_32px_#ffffff,inset_-6px_-6px_12px_rgba(0,0,0,0.02),inset_6px_6px_12px_rgba(255,255,255,1)] hover:-translate-y-2 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-white text-blue-400 flex items-center justify-center mb-6 shadow-[6px_6px_12px_#d1d5df,-6px_-6px_12px_#ffffff,inset_-2px_-2px_4px_rgba(0,0,0,0.02),inset_2px_2px_4px_rgba(255,255,255,1)]">
                   <item.i size={28} weight="duotone" />
                </div>
                <h3 className="text-xl font-black text-slate-700 mb-2">{item.t}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{item.d}</p>
             </div>
           ))}
        </div>
      </section>

      {/* CLAY CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
         <h2 className="text-5xl font-black text-slate-700 mb-6">Ready to begin?</h2>
         <p className="text-slate-500 font-medium mb-10">Join thousands of students who trust us with their careers.</p>
         <Link to="/enroll" className="inline-block px-10 py-5 rounded-3xl bg-blue-500 text-white font-black text-lg shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.15),inset_4px_4px_8px_rgba(255,255,255,0.4),12px_12px_24px_#d1d5df,-12px_-12px_24px_#ffffff] hover:scale-105 transition-transform">
           Start My Journey
         </Link>
      </section>

    </div>
  );

}

function Stat({ value, suffix, label, testid }) {
  return (
    <div data-testid={testid}>
      <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-accent">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-2">{label}</div>
    </div>
  );
}