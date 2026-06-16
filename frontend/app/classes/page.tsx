import Navbar from "@/components/Navbar";
import { fetchApi } from "@/lib/api";
import { ApiResponse, Class } from "@/types";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Zap, Sparkles, BookOpen, Search, ArrowUpRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Academic Levels",
  description: "Browse our comprehensive list of academic classes and levels. Find expert-verified study notes and subjects for Class 9, 10, 11, and 12.",
};

async function getClasses(): Promise<Class[]> {
  try {
    const res: ApiResponse<Class[]> = await fetchApi("/classes");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return [];
  }
}

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500 pb-32">
      <Navbar />
      
      {/* Immersive Hero Section */}
      <header className="relative pt-16 md:pt-24 pb-32 md:pb-40 overflow-hidden px-4">
        {/* Animated Mesh Gradients & Grid */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] md:top-[-20%] md:left-[-10%] w-[80%] h-[40%] md:w-[60%] md:h-[60%] bg-primary/20 rounded-full blur-[100px] md:blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] md:bottom-[-20%] md:right-[-10%] w-[80%] h-[40%] md:w-[60%] md:h-[60%] bg-emerald-500/10 rounded-full blur-[100px] md:blur-[150px] [animation-delay:3s] animate-pulse"></div>
          <div className="absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-[0.03] dark:opacity-[0.05] text-slate-900 dark:text-white"></div>
        </div>

        <div className="container relative z-10 text-center px-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em] text-slate-500 dark:text-slate-300">Unlock Your Potential</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 md:mb-8 leading-[1] md:leading-[0.9] drop-shadow-sm px-2">
            Elevate your <br className="hidden md:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-emerald-500 animate-gradient-x">
              knowledge.
            </span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed mb-10 md:mb-12 px-4 md:px-0">
            Access a curated ecosystem of expert-verified study notes and interactive resources designed for the modern student.
          </p>

          {/* Hero Quick Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <Button asChild className="h-14 md:h-16 w-full sm:w-auto px-8 md:px-10 rounded-2xl text-base md:text-lg font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
              <Link href="/search">
                <Search className="mr-3 h-5 w-5" /> Quick Search
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 md:h-16 w-full sm:w-auto px-8 md:px-10 rounded-2xl text-base md:text-lg font-bold border-slate-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <Link href="/about">
                How it works
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Modern Bento Grid for Classes */}
      <section className="container -mt-16 md:-mt-20 relative z-20 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {classes.length > 0 ? (
            classes.map((cls, index) => (
              <Link 
                key={cls.id} 
                href={`/classes/${cls.slug}`} 
                className="group relative h-auto md:h-[450px] min-h-[380px]"
              >
                {/* Neon Glow on Hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-[2.5rem] md:rounded-[3rem] opacity-0 group-hover:opacity-20 blur-xl transition duration-500"></div>
                
                <Card className="relative h-full transition-all duration-700 border border-slate-200 dark:border-white/[0.05] bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl overflow-hidden rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 flex flex-col items-start gap-8 md:gap-10 shadow-2xl shadow-slate-200/50 dark:shadow-none group-hover:-translate-y-3">
                  
                  {/* Floating Icon */}
                  <div className="relative">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-[1.5rem] md:rounded-[2rem] bg-slate-950 dark:bg-primary flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6 duration-700">
                      <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 h-5 w-5 md:h-6 md:w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white border-2 md:border-4 border-white dark:border-slate-900">
                      <Zap className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current" />
                    </div>
                  </div>

                  {/* Information */}
                  <div className="space-y-3 md:space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-primary/5 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-primary/10">
                        Level {index + 1}
                      </Badge>
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {cls.subject_count || 0} Modules
                      </span>
                    </div>
                    <CardTitle className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                      {cls.name}
                    </CardTitle>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-base md:text-lg leading-relaxed">
                      Comprehensive study materials tailored for {cls.name} curriculum.
                    </p>
                  </div>

                  {/* Premium Action Footer */}
                  <div className="w-full pt-6 md:pt-8 mt-auto border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
                    <span className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-300 group-hover:text-primary transition-colors flex items-center gap-2">
                      Enter Classroom <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
                    </span>
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-slate-900 dark:bg-white/5 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:rounded-full group-hover:shadow-lg group-hover:shadow-primary/30">
                      <ArrowRight className="h-5 w-5 md:h-6 md:w-6 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Glass Reflection Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 dark:via-white/[0.02] pointer-events-none"></div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-40 text-center bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-[3rem] md:rounded-[4rem] border border-dashed border-slate-200 dark:border-white/10">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-slate-300" />
              </div>
              <p className="text-slate-400 text-xl md:text-2xl font-black tracking-tight uppercase">Expanding Library...</p>
              <p className="text-slate-500 font-medium mt-4 max-w-sm mx-auto px-6">We are adding new academic levels daily. Please check back shortly for updates.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats / Trust Section */}
      <section className="container mt-24 py-16 border-t border-slate-200 dark:border-white/5 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Verified Notes", val: "500+" },
            { label: "Active Students", val: "10k+" },
            { label: "Total Subjects", val: "40+" },
            { label: "Success Rate", val: "99%" },
          ].map((stat, i) => (
            <div key={i} className="text-center md:text-left space-y-1">
              <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stat.val}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Hint (Hidden on mobile to save space) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 hidden md:block animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-1000">
        <div className="bg-slate-900/90 dark:bg-white/10 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-white tracking-widest uppercase">System Online • 24/7 Access</span>
        </div>
      </div>
    </main>
  );
}
