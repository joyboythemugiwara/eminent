'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, Compass, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#020617] transition-colors duration-500 overflow-hidden relative">
      <Navbar />

      {/* Background Polish */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 bg-dot-grid opacity-[0.03] dark:opacity-[0.05]"></div>
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        {/* Animated 404 Header */}
        <div className="relative mb-8">
          <h1 className="text-[10rem] md:text-[15rem] font-black leading-none tracking-tighter text-slate-200 dark:text-slate-900 select-none animate-in fade-in zoom-in duration-1000">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center animate-bounce duration-[2000ms]">
              <Compass className="h-12 w-12 text-primary" />
            </div>
          </div>
        </div>

        <div className="max-w-xl space-y-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Lost in knowledge?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
            The page you are looking for has been moved, renamed, or perhaps never existed. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Button asChild className="h-14 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" /> Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 px-8 rounded-2xl font-bold border-slate-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <Link href="/search">
                <Search className="mr-2 h-5 w-5" /> Search Library
              </Link>
            </Button>
          </div>
          
          <button 
            onClick={() => window.history.back()}
            className="text-slate-400 hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2 mx-auto pt-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            Return to previous page
          </button>
        </div>
      </div>

      {/* Floating Status Badge */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-1000">
        <div className="bg-slate-900/90 dark:bg-white/10 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Page Missing • Navigation Active</span>
        </div>
      </div>
    </main>
  );
}
