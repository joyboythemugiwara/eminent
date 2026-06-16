import Navbar from "@/components/Navbar";
import { fetchApi } from "@/lib/api";
import { ApiResponse, Chapter, Note, Subject } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, ChevronRight, Home, BookOpen, Eye, Sparkles, LayoutGrid, Info, Search } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res: ApiResponse<Subject & { class_name: string }> = await fetchApi(`/subjects/${id}/full`);
    return {
      title: `${res.data.name} Chapters & Notes`,
      description: `Access high-quality chapter-wise notes and study resources for ${res.data.name} (${res.data.class_name}). Prepare effectively for your exams with expert content.`,
    };
  } catch {
    return {
      title: "Subject Not Found",
    };
  }
}

interface SubjectWithChapters extends Subject {
  class_name: string;
  class_slug: string;
  chapters: (Chapter & { notes: Note[] })[];
}

async function getSubjectData(subjectId: string): Promise<SubjectWithChapters | null> {
  try {
    const res: ApiResponse<SubjectWithChapters> = await fetchApi(`/subjects/${subjectId}/full`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch subject data for ${subjectId}:`, error);
    return null;
  }
}

export default async function ChaptersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getSubjectData(id);

  if (!data) {
    return (
      <main className="min-h-screen bg-[#fafafa] dark:bg-[#020617]">
        <Navbar />
        <div className="container py-24 text-center">
          <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-6 rotate-6">
            <LayoutGrid className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-4xl font-black mb-4 text-slate-900 dark:text-white">Subject Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">The subject you are looking for does not exist or has been moved.</p>
          <Button asChild className="rounded-2xl h-12 px-8 font-bold">
            <Link href="/classes">
              <Home className="h-4 w-4 mr-2" /> Back to Classes
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const { chapters, name: subjectName, class_name, class_slug } = data;

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#020617] transition-colors duration-500 pb-32">
      <Navbar />
      
      {/* Premium Immersive Header */}
      <header className="relative bg-slate-950 pt-16 pb-32 overflow-hidden border-b border-white/[0.05]">
        {/* Dynamic Visual Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[150px] -translate-y-1/2 -translate-x-1/4"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] translate-y-1/4 translate-x-1/4"></div>
          <div className="absolute inset-0 bg-dot-grid opacity-[0.05] text-white"></div>
        </div>

        <div className="container relative z-10">
          {/* Branded Breadcrumbs */}
          <Breadcrumb className="mb-10">
            <BreadcrumbList className="text-slate-500 text-xs md:text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="hover:text-primary transition-colors">
                  <Link href="/classes">Catalog</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-800" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="hover:text-primary transition-colors">
                  <Link href={`/classes/${class_slug}`}>{class_name}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-slate-800" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-200 font-bold">{subjectName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="h-3 w-3 fill-current" />
              Study Modules
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white animate-in fade-in slide-in-from-top-4">
              {subjectName} <br />
              <span className="text-slate-500">Chapters & Notes</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed animate-in fade-in slide-in-from-top-4 duration-700">
              Access professionally organized study materials for every chapter of {subjectName} in {class_name}.
            </p>
          </div>
        </div>
      </header>

      <section className="container py-16 -mt-12 relative z-20">
        <div className="space-y-20">
          {chapters.length > 0 ? (
            chapters.map((chapter, index) => (
              <div key={chapter.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Chapter Section Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 group">
                  <div className="flex-shrink-0 w-16 h-16 rounded-[1.5rem] bg-slate-900 dark:bg-primary text-white flex items-center justify-center font-black text-2xl shadow-xl transition-transform group-hover:scale-110 group-hover:-rotate-3">
                    {chapter.chapter_number || index + 1}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                      {chapter.name}
                    </h2>
                    {chapter.description && (
                      <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-4xl">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:ml-20">
                  {chapter.notes.length > 0 ? (
                    chapter.notes.map((note) => (
                      <Card key={note.id} className="group relative h-full transition-all duration-500 border border-slate-200 dark:border-white/[0.05] bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl overflow-hidden rounded-[2rem] p-6 shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-2">
                        <CardContent className="p-0 flex flex-col h-full space-y-6">
                          <div className="flex items-start justify-between">
                            <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center shadow-inner transition-colors group-hover:bg-red-500/20 duration-500">
                              <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                              <Info className="h-3 w-3" /> PDF DOCUMENT
                            </div>
                          </div>

                          <div className="space-y-1 flex-1">
                            <h4 className="font-black text-xl text-slate-900 dark:text-white leading-tight line-clamp-2" title={note.title}>
                              {note.title}
                            </h4>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block pt-1">
                               {note.file_size_bytes 
                                  ? `${(Number(note.file_size_bytes) / (1024 * 1024)).toFixed(2)} MB` 
                                  : "Optimized File"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50 dark:border-white/5">
                            <Button asChild variant="outline" size="sm" className="h-10 rounded-xl font-bold border-slate-200 dark:border-white/10 group-hover:bg-slate-50 dark:group-hover:bg-white/5 transition-all">
                              <a 
                                href={note.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2"
                              >
                                <Download className="h-4 w-4" /> Download
                              </a>
                            </Button>
                            <Button asChild size="sm" className="h-10 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                              <Link href={`/notes/${note.id}`} className="flex items-center justify-center gap-2">
                                <Eye className="h-4 w-4" /> Read Online
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                        {/* Hidden border reveal on hover */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full py-10 px-10 bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-4 animate-pulse">
                      <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold text-sm italic">
                        The learning materials for this module are being finalized.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-40 text-center bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
              <Zap className="h-16 w-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-400 tracking-tight uppercase mb-2">Curriculum Pending</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">We are currently drafting the chapters for this subject. Check back soon for the updated roadmap.</p>
              <Button asChild className="rounded-2xl h-14 px-10 font-black shadow-2xl shadow-primary/20">
                <Link href="/classes">Explore Other Classes</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Floating Action */}
      <div className="fixed bottom-10 right-10 z-50 hidden lg:block animate-in fade-in slide-in-from-right-10 duration-1000 delay-1000">
        <Button asChild className="h-14 w-14 rounded-full p-0 shadow-2xl hover:scale-110 transition-all active:scale-95">
          <Link href="/search">
            <Search className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
