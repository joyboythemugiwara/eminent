import Navbar from "@/components/Navbar";
import { Card, CardTitle } from "@/components/ui/card";
import { Sparkles, Info, CheckCircle2, Globe, Heart, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#020617] transition-colors duration-500 pb-32">
      <Navbar />
      
      {/* Immersive Header */}
      <header className="relative pt-20 pb-32 overflow-hidden border-b border-white/[0.05] bg-slate-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 -translate-x-1/4"></div>
          <div className="absolute inset-0 bg-dot-grid opacity-[0.05] text-white"></div>
        </div>

        <div className="container relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
            <Info className="h-3 w-3" />
            Our Mission
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white animate-in fade-in slide-in-from-top-4">
            Democratizing <br />
            <span className="text-slate-500 text-4xl md:text-6xl">Quality Education.</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
            Eminent Tutorials is a dedicated ecosystem designed to empower students with 
            professionally curated learning resources and structured academic materials.
          </p>
        </div>
      </header>

      <section className="container -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Main Philosophy */}
          <Card className="p-10 md:p-16 rounded-[3rem] border border-slate-200 dark:border-white/[0.05] bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl shadow-2xl space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <Heart className="h-6 w-6 text-red-500 fill-current" /> Why we exist.
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">
                We believe that every student deserves access to premium study materials regardless 
                of their background. Our platform bridges the gap between complex curricula and 
                student understanding through meticulously organized modules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {[
                { icon: CheckCircle2, text: "Expert Verified Content" },
                { icon: Globe, text: "24/7 Global Access" },
                { icon: Shield, text: "Ad-Free Learning Space" },
                { icon: Sparkles, text: "Regularly Updated" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Structural Overview */}
          <div className="space-y-12 py-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">The Architecture</h3>
              <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Built for Clarity.</h2>
            </div>
            
            <div className="space-y-8">
              {[
                { title: "Classes", desc: "Top-level categorization of academic tiers." },
                { title: "Subjects", desc: "Focused study areas curated for each level." },
                { title: "Chapters", desc: "Granular breakdown into digestible learning modules." },
                { title: "Notes", desc: "Optimized PDF resources ready for offline revision." },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex-shrink-0 h-12 w-12 rounded-2xl bg-slate-900 dark:bg-white/5 flex items-center justify-center text-white font-black group-hover:bg-primary transition-colors">
                    {i + 1}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
