"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home, Terminal, ShieldAlert } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical System Error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500 overflow-hidden relative">
      <Navbar />

      {/* Error Background Polish */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-destructive/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute inset-0 bg-dot-grid opacity-[0.03] dark:opacity-[0.05]"></div>
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        {/* Animated Error Header */}
        <div className="relative mb-12">
          <div className="h-32 w-32 rounded-[2.5rem] bg-destructive/5 dark:bg-destructive/10 flex items-center justify-center rotate-6 animate-in zoom-in duration-500">
            <ShieldAlert className="h-16 w-12 text-destructive" />
          </div>
          <div className="absolute -top-4 -right-4 h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center animate-bounce">
            <Terminal className="h-6 w-6 text-slate-400" />
          </div>
        </div>

        <div className="max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            System Alert
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
            Something went wrong.
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
            We've encountered a technical disturbance. Our team has been notified, 
            and we're working to restore the frequency.
          </p>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 text-left overflow-auto max-h-40 shadow-xl">
              <p className="text-xs font-mono text-destructive flex gap-2">
                <span className="font-bold select-none opacity-50">ERROR:</span>
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Button 
              onClick={() => reset()} 
              className="h-14 px-10 rounded-2xl font-bold bg-slate-900 dark:bg-primary text-white shadow-2xl hover:scale-105 transition-all"
            >
              <RotateCcw className="mr-2 h-5 w-5" /> Reload Page
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="h-14 px-10 rounded-2xl font-bold border-slate-200 dark:border-white/10 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" /> Return Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Status Badge */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-1000">
        <div className="bg-slate-900/90 dark:bg-white/10 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Error Detected • Support Notified</span>
        </div>
      </div>
    </main>
  );
}
