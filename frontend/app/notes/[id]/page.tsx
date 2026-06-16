import Navbar from "@/components/Navbar";
import { fetchApi } from "@/lib/api";
import { ApiResponse } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, ChevronLeft, ExternalLink, FileText, Calendar, HardDrive, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
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
    const res: ApiResponse<NoteDetail> = await fetchApi(`/notes/${id}`);
    return {
      title: `${res.data.title} PDF Download`,
      description: `View and download ${res.data.title} for ${res.data.subject_name} (${res.data.class_name}). Comprehensive PDF study notes for academic excellence.`,
    };
  } catch {
    return {
      title: "Note Not Found",
    };
  }
}

interface NoteDetail {
  id: string;
  title: string;
  file_url: string;
  file_size_bytes: string;
  uploaded_at: string;
  chapter_name: string;
  chapter_id: string;
  chapter_description: string | null;
  subject_name: string;
  subject_id: string;
  class_name: string;
  class_slug: string;
}

async function getNoteDetail(id: string): Promise<NoteDetail | null> {
  try {
    const res: ApiResponse<NoteDetail> = await fetchApi(`/notes/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch note detail for ${id}:`, error);
    return null;
  }
}

export default async function NoteViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getNoteDetail(id);

  if (!note) {
    return (
      <main className="min-h-screen bg-[#fafafa] dark:bg-[#020617]">
        <Navbar />
        <div className="container py-24 text-center">
          <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-6 rotate-6">
            <FileText className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-4xl font-black mb-4">Note Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">The document you are looking for does not exist or has been removed from our cloud storage.</p>
          <Button asChild className="rounded-2xl h-12 px-8 font-bold">
            <Link href="/classes">Back to Classes</Link>
          </Button>
        </div>
      </main>
    );
  }

  const formattedDate = new Date(note.uploaded_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const fileSize = note.file_size_bytes 
    ? `${(Number(note.file_size_bytes) / (1024 * 1024)).toFixed(2)} MB` 
    : "Cloud Optimized";

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#020617] transition-colors duration-500">
      <Navbar />
      
      <div className="container py-12 px-4 md:px-6">
        {/* Themed Breadcrumbs */}
        <Breadcrumb className="mb-10">
          <BreadcrumbList className="text-slate-400">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="hover:text-primary transition-colors">
                <Link href="/classes">Classes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="hover:text-primary transition-colors">
                <Link href={`/classes/${note.class_slug}`}>{note.class_name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="hover:text-primary transition-colors">
                <Link href={`/subjects/${note.subject_id}/chapters`}>{note.subject_name}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-slate-900 dark:text-slate-200 font-bold">{note.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Metadata Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-white/[0.05]">
              <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-8 shadow-inner">
                <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h1 className="text-3xl font-black tracking-tight mb-4 leading-tight text-slate-900 dark:text-white">
                {note.title}
              </h1>
              
              <div className="space-y-5 mt-8">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Published</span>
                    <span className="text-slate-600 dark:text-slate-300 font-bold">{formattedDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                    <HardDrive className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">File Size</span>
                    <span className="text-slate-600 dark:text-slate-300 font-bold">{fileSize}</span>
                  </div>
                </div>
              </div>

              {note.chapter_description && (
                <div className="mt-8 p-5 rounded-[2rem] bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-left-4 duration-700">
                  <div className="flex items-center gap-2 mb-3 text-primary font-black text-[10px] uppercase tracking-widest">
                    <BookOpen className="h-3 w-3 fill-current" /> Chapter Insights
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                    "{note.chapter_description}"
                  </p>
                </div>
              )}

              <div className="mt-10 space-y-3">
                <Button asChild className="w-full rounded-2xl h-14 font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                  <a href={note.file_url} download>
                    <Download className="mr-2 h-5 w-5" /> Download PDF
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-2xl h-14 font-bold border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  <a href={note.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open Original
                  </a>
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Resource</span>
              </div>
            </div>

            <Button asChild variant="ghost" className="w-full justify-start text-slate-400 hover:text-primary rounded-2xl font-bold h-12">
              <Link href={`/subjects/${note.subject_id}/chapters`}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to Chapters
              </Link>
            </Button>
          </div>

          {/* Premium PDF Viewer Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-[#0f172a] rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/[0.05] h-[85vh] flex flex-col relative group/viewer">
              
              {/* Viewer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Secure Cloud Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Academy Premium</span>
                </div>
              </div>

              {/* PDF Container */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
                <iframe 
                  src={`${note.file_url}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-none"
                  title={note.title}
                />
                
                {/* Visual Overlay for context */}
                <div className="absolute inset-0 pointer-events-none border-[12px] border-white dark:border-slate-900 opacity-50 rounded-[2.5rem]"></div>
              </div>

              {/* Viewer Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <BookOpen className="h-3 w-3" /> Reading Mode Active
                </div>
              </div>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">
              Scroll to explore • Use download for offline access
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
