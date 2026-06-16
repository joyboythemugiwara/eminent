"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { Class, Subject, Chapter, Note } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2,
  Info,
  ChevronRight,
  ArrowUpRight,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  LayoutGrid,
  List,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AdminNote extends Note {
  chapter_name: string;
  subject_name: string;
  class_name: string;
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"grouped" | "flat">("grouped");
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const hasLoaded = useRef(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsRes, notesRes] = await Promise.all([
        fetchApi("/classes"),
        fetchApi("/admin/notes")
      ]);
      setClasses(clsRes.data);
      setNotes(notesRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notes data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      loadData();
      hasLoaded.current = true;
    }
  }, []);

  const handleClassChange = async (classSlug: string) => {
    setSelectedClass(classSlug);
    setSelectedSubject("");
    setSelectedChapter("");
    setSubjects([]);
    setChapters([]);
    try {
      const res = await fetchApi(`/classes/${classSlug}/subjects`);
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubjectChange = async (subjectId: string) => {
    setSelectedSubject(subjectId);
    setSelectedChapter("");
    setChapters([]);
    try {
      const res = await fetchApi(`/subjects/${subjectId}/chapters`);
      setChapters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedChapter || !title) return;

    setUploading(true);
    try {
      const presignRes = await fetchApi("/admin/notes/presign", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          classSlug: selectedClass,
          subjectSlug: subjects.find(s => s.id === selectedSubject)?.slug,
          chapterId: selectedChapter
        }),
      });

      const { uploadUrl, fileKey, publicUrl } = presignRes.data;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) throw new Error("Upload to R2 failed");

      await fetchApi("/admin/notes", {
        method: "POST",
        body: JSON.stringify({
          chapter_id: selectedChapter,
          title,
          file_url: publicUrl,
          file_key: fileKey,
          file_size_bytes: file.size,
        }),
      });

      setIsAdding(false);
      setTitle("");
      setFile(null);
      setSelectedClass("");
      setSelectedSubject("");
      setSelectedChapter("");
      loadData();
      toast.success("Note uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload note");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await fetchApi(`/admin/notes/${id}`, { method: "DELETE" });
      setNotes(notes.filter(n => n.id !== id));
      toast.success("Note deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete note");
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group notes by subject_name
  const groupedNotes: Record<string, AdminNote[]> = {};
  filteredNotes.forEach(note => {
    if (!groupedNotes[note.subject_name]) {
      groupedNotes[note.subject_name] = [];
    }
    groupedNotes[note.subject_name].push(note);
  });

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">Study Resources</h1>
          <p className="text-muted-foreground text-sm lg:text-base mt-1">Upload and manage curriculum PDF materials.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-2">
            <Button 
              variant={viewType === "grouped" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewType("grouped")}
              className="rounded-lg h-8 px-3 font-bold text-xs"
            >
              <LayoutGrid className="h-3 w-3 mr-1.5" /> Grouped
            </Button>
            <Button 
              variant={viewType === "flat" ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewType("flat")}
              className="rounded-lg h-8 px-3 font-bold text-xs"
            >
              <List className="h-3 w-3 mr-1.5" /> Flat List
            </Button>
          </div>
          <Button 
            onClick={() => setIsAdding(!isAdding)} 
            variant={isAdding ? "outline" : "default"}
            className="rounded-xl h-10 font-bold shadow-md shadow-primary/10 px-6 transition-all active:scale-95"
          >
            {isAdding ? "Cancel" : <><Upload className="mr-2 h-4 w-4" /> Upload Note</>}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="border-primary/20 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 bg-white dark:bg-slate-900">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 pb-8">
            <CardTitle className="text-xl">Upload PDF Resource</CardTitle>
            <CardDescription>Direct-to-Cloud storage for maximum speed.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpload}>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold ml-1">Note Title</label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Introduction to Algebra"
                    className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold ml-1">Target Class</label>
                  <Select value={selectedClass} onValueChange={handleClassChange} required>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200">
                      <SelectValue placeholder="Select class..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {classes.map(c => <SelectItem key={c.id} value={c.slug} className="rounded-xl">{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold ml-1">Subject</label>
                  <Select 
                    value={selectedSubject} 
                    onValueChange={handleSubjectChange} 
                    disabled={!selectedClass}
                    required
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200">
                      <SelectValue placeholder={!selectedClass ? "Choose class first" : "Select subject..."} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {subjects.map(s => <SelectItem key={s.id} value={s.id} className="rounded-xl">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold ml-1">Chapter</label>
                  <Select 
                    value={selectedChapter} 
                    onValueChange={setSelectedChapter} 
                    disabled={!selectedSubject}
                    required
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200">
                      <SelectValue placeholder={!selectedSubject ? "Choose subject first" : "Select chapter..."} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {chapters.map(c => (
                        <SelectItem key={c.id} value={c.id} className="rounded-xl">
                          {c.chapter_number ? `${c.chapter_number}. ` : ""}{c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold ml-1">PDF Document</label>
                <div className="relative group h-40 flex items-center justify-center border-2 border-slate-200 border-dashed rounded-3xl hover:border-primary hover:bg-primary/5 transition-all bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="text-center px-6">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex text-sm font-medium justify-center">
                      <label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                        <span>{file ? "Change file" : "Choose a PDF"}</span>
                        <input id="file-upload" type="file" className="sr-only" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} required={!file} />
                      </label>
                      {!file && <span className="ml-1 text-slate-400">or drop it here</span>}
                    </div>
                    {file && (
                      <Badge variant="secondary" className="mt-3 py-1.5 px-4 rounded-xl flex items-center gap-2 border-primary/20 bg-primary/5 text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                        {file.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 dark:bg-slate-800/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Info className="h-4 w-4" /> Cloudflare R2 Enabled
              </div>
              <Button 
                type="submit" 
                disabled={uploading}
                className="rounded-2xl h-12 px-10 font-extrabold shadow-lg shadow-primary/20 w-full sm:w-auto transition-all active:scale-95"
              >
                {uploading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Uploading...</>
                ) : (
                  <><CheckCircle2 className="mr-2 h-5 w-5" /> Start Upload</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Search & List */}
      <Card className="rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border-slate-200/60 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 transition-all">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-950"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-auto">
            <Filter className="h-3.5 w-3.5" /> Recently Uploaded
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary opacity-50" />
              <p className="font-bold text-xs uppercase tracking-widest opacity-60">Syncing Cloud Assets...</p>
            </div>
          ) : filteredNotes.length > 0 ? (
            viewType === "grouped" && !searchQuery ? (
              <Accordion type="multiple" className="w-full">
                {Object.keys(groupedNotes).sort().map((subjectName) => {
                  const subjectNotes = groupedNotes[subjectName];
                  const className = subjectNotes[0].class_name;
                  
                  return (
                    <AccordionItem key={subjectName} value={subjectName} className="border-b border-slate-50 dark:border-slate-800 last:border-0 px-6">
                      <AccordionTrigger className="hover:no-underline py-6 group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-slate-800 flex items-center justify-center group-data-[state=open]:bg-red-600 group-data-[state=open]:text-white transition-colors">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-black text-xl tracking-tight">{subjectName}</h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{className} • {subjectNotes.length} Documents</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-8 pt-2">
                        <Table>
                          <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl">
                            <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                              <TableHead className="font-bold py-4 pl-8">Note Title</TableHead>
                              <TableHead className="font-bold">Chapter</TableHead>
                              <TableHead className="font-bold">Size</TableHead>
                              <TableHead className="font-bold text-right pr-8">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {subjectNotes.map((note) => (
                              <TableRow key={note.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 border-slate-50 dark:border-slate-800 transition-colors">
                                <TableCell className="py-4 pl-8">
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-red-600" />
                                    <span className="font-bold text-sm">{note.title}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs font-semibold text-slate-500">
                                  {note.chapter_name}
                                </TableCell>
                                <TableCell className="text-[10px] font-mono font-bold text-slate-400">
                                  {(Number(note.file_size_bytes) / (1024 * 1024)).toFixed(2)} MB
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                  <div className="flex justify-end items-center gap-1">
                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary transition-all">
                                      <a href={note.file_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleDeleteNote(note.id)}
                                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold py-5 pl-8">Document</TableHead>
                      <TableHead className="font-bold">Hierarchy</TableHead>
                      <TableHead className="font-bold">Size</TableHead>
                      <TableHead className="font-bold text-right pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotes.map((note) => (
                      <TableRow key={note.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30">
                        <TableCell className="py-5 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground leading-none mb-1">{note.title}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                                {new Date(note.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="w-fit text-[10px] px-2 py-0 rounded-md bg-slate-50 dark:bg-slate-800 border-slate-200">
                              {note.class_name}
                            </Badge>
                            <span className="text-xs font-semibold text-slate-500">{note.subject_name} • {note.chapter_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {note.file_size_bytes 
                              ? `${(Number(note.file_size_bytes) / (1024 * 1024)).toFixed(2)} MB` 
                              : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end items-center gap-2">
                            <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary transition-all">
                              <a href={note.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteNote(note.id)}
                              className="h-10 w-10 rounded-xl text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <div className="py-24 text-center">
              <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="font-bold text-slate-400">No notes found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
