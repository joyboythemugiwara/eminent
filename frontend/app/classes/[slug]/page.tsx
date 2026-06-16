import Navbar from "@/components/Navbar";
import { fetchApi } from "@/lib/api";
import { ApiResponse, Class, Subject } from "@/types";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ChevronRight, Home, LayoutGrid, Sparkles, ArrowRight, Zap } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res: ApiResponse<Class> = await fetchApi(`/classes/${slug}`);
    return {
      title: `${res.data.name} Study Materials`,
      description: `Comprehensive study notes, subjects, and interactive resources specifically curated for ${res.data.name}. Master your curriculum with expert-verified content.`,
    };
  } catch {
    return {
      title: "Class Not Found",
    };
  }
}

async function getClassData(slug: string): Promise<{ classInfo: Class; subjects: Subject[] } | null> {
  try {
    const res: ApiResponse<Class & { subjects: Subject[] }> = await fetchApi(`/classes/${slug}/full`);
    
    const { subjects, ...classInfo } = res.data;

    return {
      classInfo,
      subjects,
    };
  } catch (error) {
    console.error(`Failed to fetch data for class ${slug}:`, error);
    return null;
  }
}

export default async function SubjectsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getClassData(slug);

  if (!data) {
    return (
      <main className="min-h-screen bg-[#fafafa] dark:bg-[#020617]">
        <Navbar />
        <div className="container py-24 text-center">
          <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-6 rotate-6">
            <LayoutGrid className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-4xl font-black mb-4">Class Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">The academic level you are looking for does not exist or has been relocated.</p>
          <Button asChild className="rounded-2xl h-12 px-8 font-bold">
            <Link href="/classes">
              <Home className="h-4 w-4 mr-2" /> Back to Catalog
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const { classInfo, subjects } = data;

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#020617] transition-colors duration-500 pb-32">
      <Navbar />
      
      {/* Immersive Header */}
      <header className="relative bg-slate-950 pt-16 pb-32 overflow-hidden border-b border-white/[0.05]">
        {/* Dynamic Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute inset-0 bg-dot-grid opacity-[0.05] text-white"></div>
        </div>

        <div className="container relative z-10">
          {/* Enhanced Breadcrumbs */}
          <Breadcrumb className="mb-10">
            <BreadcrumbList className="text-slate-500">
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="hover:text-primary transition-colors">
                  <Link href="/classes">Catalog</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-800" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-200 font-bold">{classInfo.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="h-3 w-3" />
              Resource Hub
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white animate-in fade-in slide-in-from-top-4">
              {classInfo.name} <span className="text-slate-500">Modules</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed animate-in fade-in slide-in-from-top-4 duration-700">
              Dive into your curriculum. We've organized everything you need for {classInfo.name} in one place.
            </p>
          </div>
        </div>
      </header>

      {/* Subjects Grid */}
      <section className="container -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {subjects.length > 0 ? (
            subjects.map((subject, index) => (
              <Link 
                key={subject.id} 
                href={`/subjects/${subject.id}/chapters`} 
                className="group relative h-[280px]"
              >
                {/* Subtle Border Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-emerald-500/50 rounded-[2.5rem] opacity-0 group-hover:opacity-100 blur-md transition duration-500"></div>
                
                <Card className="relative h-full transition-all duration-500 border border-slate-200 dark:border-white/[0.05] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl overflow-hidden rounded-[2.5rem] p-8 flex flex-col justify-between shadow-xl shadow-slate-200/50 dark:shadow-none group-hover:-translate-y-2">
                  
                  <div className="flex items-start justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center shadow-inner group-hover:bg-primary/10 transition-colors duration-500">
                      <span className="text-3xl filter group-hover:scale-110 transition-transform duration-500 grayscale group-hover:grayscale-0">
                        {subject.icon || "📖"}
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary transition-all duration-500">
                      <ArrowRight className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">
                      {subject.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resources Active</span>
                    </div>
                  </div>

                  {/* Hidden footer reveal */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
              <Zap className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-xl font-bold tracking-tight">Curating your subjects...</p>
              <p className="text-slate-500 text-sm mt-1 mb-8">We are setting up the modules for this class. Stay tuned!</p>
              <Button asChild variant="outline" className="rounded-2xl h-12 font-bold px-8">
                <Link href="/classes">Explore Other Classes</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Floating Insight */}
      <div className="container mt-24">
        <div className="bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-2xl font-black tracking-tight">Missing something?</h4>
            <p className="text-slate-500 font-medium max-w-md">Can't find a specific subject or topic for {classInfo.name}? Let our team know and we'll prioritize it.</p>
          </div>
          <Button className="h-14 px-10 rounded-2xl font-bold shadow-xl shadow-primary/20">
            Request Content
          </Button>
        </div>
      </div>
    </main>
  );
}

// Button placeholder helper for the 404 block
function Button({ children, className, ...props }: any) {
  return <button className={className} {...props}>{children}</button>;
}
