import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, RefreshCcw, ArrowRight, Sparkles, Zap, GraduationCap, Play } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#020617] transition-colors duration-500 pb-32">
      <Navbar />
      
      {/* Immersive Hero Section */}
      <header className="relative pt-24 pb-40 overflow-hidden">
        {/* Animated Visuals */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px] [animation-delay:3s] animate-pulse"></div>
          <div className="absolute inset-0 bg-dot-grid opacity-[0.03] dark:opacity-[0.05] text-slate-900 dark:text-white"></div>
        </div>

        <div className="container relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">Empowering Academic Excellence</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 leading-[0.9] drop-shadow-sm">
            Master your <br className="hidden md:block" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-emerald-500 animate-gradient-x">
              curriculum.
            </span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed mb-12">
            Access a premium collection of expert-verified study notes and interactive resources designed for the modern student.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <Button asChild className="h-16 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
              <Link href="/classes">
                Browse Classes <ArrowRight className="ml-3 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 px-10 rounded-2xl text-lg font-bold border-slate-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <Link href="/about">
                <Play className="mr-3 h-4 w-4 fill-current" /> Learn More
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Bento Section */}
      <section className="container -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group relative h-full transition-all duration-700 border border-slate-200 dark:border-white/[0.05] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] p-10 flex flex-col items-start gap-8 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-3">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-primary flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500">
              <BookOpen className="h-8 w-8 text-primary dark:text-white" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-black tracking-tight">Structured Learning</CardTitle>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Materials organized logically from Classes to Subjects and Chapters for seamless navigation.
              </p>
            </div>
          </Card>

          <Card className="group relative h-full transition-all duration-700 border border-slate-200 dark:border-white/[0.05] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] p-10 flex flex-col items-start gap-8 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-3">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500">
              <FileText className="h-8 w-8 text-emerald-600 dark:text-white" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-black tracking-tight">Premium PDFs</CardTitle>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                High-quality, readable study notes available for instant access on any device, anywhere.
              </p>
            </div>
          </Card>

          <Card className="group relative h-full transition-all duration-700 border border-slate-200 dark:border-white/[0.05] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3rem] p-10 flex flex-col items-start gap-8 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-3">
            <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-500 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500">
              <RefreshCcw className="h-8 w-8 text-amber-600 dark:text-white" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-black tracking-tight">Always Current</CardTitle>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Constantly updated curriculum matching the latest board requirements and standards.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Social Trust Section */}
      <section className="container mt-32 py-20 border-t border-slate-200 dark:border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Join thousands of students.</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-lg">
              Experience a new way of learning with resources that prioritize clarity and academic success.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
             <div className="text-center md:text-left">
              <p className="text-4xl font-black text-primary">10k+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Learners</p>
            </div>
             <div className="text-center md:text-left">
              <p className="text-4xl font-black text-emerald-500">500+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Study Modules</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
