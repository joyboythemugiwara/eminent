"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { Class, Subject, Chapter } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  Search, 
  Bookmark, 
  Milestone,
  LayoutGrid,
  List,
  Filter,
  BookOpen
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function SortableRow({ 
  chapter, 
  onEdit, 
  onDelete 
}: { 
  chapter: Chapter; 
  onEdit: (chap: Chapter) => void; 
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 border-slate-50 dark:border-slate-800 transition-colors group"
    >
      <TableCell className="text-center font-black text-slate-300 dark:text-slate-700 text-base italic pl-8 w-20">
        <div className="flex items-center gap-3">
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
          {chapter.chapter_number || "-"}
        </div>
      </TableCell>
      <TableCell className="py-4 min-w-[200px]">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 font-black text-xs">
            <Bookmark className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-foreground">{chapter.name}</span>
            {chapter.description && (
              <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[300px]">{chapter.description}</span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right pr-6">
        <div className="flex justify-end items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
            onClick={() => onEdit(chapter)}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
            onClick={() => onDelete(chapter.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"grouped" | "flat">("grouped");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newChapterName, setNewChapterName] = useState("");
  const [newChapterNumber, setNewChapterNumber] = useState("1");
  const [newChapterDescription, setNewChapterDescription] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Edit state
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editClassId, setEditClassId] = useState("");
  const [updating, setUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [clsRes, subRes, chapRes] = await Promise.all([
        fetchApi("/classes"),
        fetchApi("/admin/subjects/all"),
        fetchApi("/admin/chapters/all")
      ]);
      setClasses(clsRes.data);
      setSubjects(subRes.data);
      setChapters(chapRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const hasLoaded = useRef(false);
  useEffect(() => {
    if (!hasLoaded.current) {
      loadData();
      hasLoaded.current = true;
    }
  }, []);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSubjectId("");
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim() || !selectedSubjectId) return;

    setSubmitting(true);
    try {
      await fetchApi("/admin/chapters", {
        method: "POST",
        body: JSON.stringify({ 
          name: newChapterName,
          subject_id: selectedSubjectId,
          chapter_number: parseInt(newChapterNumber) || null,
          description: newChapterDescription
        }),
      });
      setNewChapterName("");
      setNewChapterNumber("1");
      setNewChapterDescription("");
      setIsAdding(false);
      loadData();
      toast.success("Chapter added successfully");
    } catch (err) {
      toast.error("Failed to add chapter");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter || !editName.trim() || !editSubjectId) return;

    setUpdating(true);
    try {
      await fetchApi(`/admin/chapters/${editingChapter.id}`, {
        method: "PUT",
        body: JSON.stringify({ 
          name: editName,
          subject_id: editSubjectId,
          chapter_number: parseInt(editNumber) || null,
          description: editDescription
        }),
      });
      setEditingChapter(null);
      loadData();
      toast.success("Chapter updated successfully");
    } catch (err) {
      toast.error("Failed to update chapter");
    } finally {
      setUpdating(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent, subjectId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const subjectChapters = chapters.filter(c => c.subject_id === subjectId);
      const oldIndex = subjectChapters.findIndex((i) => i.id === active.id);
      const newIndex = subjectChapters.findIndex((i) => i.id === over.id);
      
      const updatedChapters = arrayMove(subjectChapters, oldIndex, newIndex);
      
      const otherChapters = chapters.filter(c => c.subject_id !== subjectId);
      setChapters([...otherChapters, ...updatedChapters]);

      const reorderItems = updatedChapters.map((item, index) => ({
        id: item.id,
        order_index: index,
      }));

      try {
        await fetchApi("/admin/chapters/reorder", {
          method: "PATCH",
          body: JSON.stringify({ items: reorderItems }),
        });
      } catch (err) {
        toast.error("Reorder failed");
        loadData();
      }
    }
  };

  const openEditDialog = (chap: Chapter) => {
    setEditingChapter(chap);
    setEditName(chap.name);
    setEditNumber(chap.chapter_number?.toString() || "");
    setEditDescription(chap.description || "");
    setEditSubjectId(chap.subject_id);
    
    const subject = subjects.find(s => s.id === chap.subject_id);
    if (subject) {
      setEditClassId(subject.class_id);
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm("Are you sure? This will delete all notes in this chapter.")) return;

    try {
      await fetchApi(`/admin/chapters/${id}`, { method: "DELETE" });
      loadData();
      toast.success("Chapter deleted successfully");
    } catch (err) {
      toast.error("Failed to delete chapter");
    }
  };

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || "Unknown Subject";
  };

  const getClassNameForSubject = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return "Unknown Class";
    return classes.find(c => c.id === subject.class_id)?.name || "Unknown Class";
  };

  const filteredChapters = chapters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getSubjectName(c.subject_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableSubjects = subjects.filter(s => s.class_id === selectedClassId);
  const editAvailableSubjects = subjects.filter(s => s.class_id === editClassId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 font-bold uppercase tracking-widest text-[10px]">
            <Milestone className="h-3 w-3" />
            Curriculum Breakdown
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Chapters Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Organize learning modules by subject.</p>
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
            className="rounded-2xl h-10 font-bold shadow-xl shadow-amber-600/10 px-6 transition-all active:scale-95"
          >
            {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> New Chapter</>}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-none shadow-sm bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-amber-600 font-black text-3xl">{chapters.length}</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600/60 mt-1">Total Chapters</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className="border-amber-600/20 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <CardHeader className="bg-amber-50/30 dark:bg-amber-950/20 pb-6 border-b border-amber-50">
            <CardTitle className="text-lg">Add New Chapter</CardTitle>
            <CardDescription>Associate a chapter with a subject and class.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleAddChapter} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Academic Level</label>
                  <Select value={selectedClassId} onValueChange={handleClassChange} required>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200">
                      <SelectValue placeholder="Select class..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {classes.map(c => <SelectItem key={c.id} value={c.id} className="rounded-xl">{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                  <Select 
                    value={selectedSubjectId} 
                    onValueChange={setSelectedSubjectId} 
                    disabled={!selectedClassId}
                    required
                  >
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200">
                      <SelectValue placeholder="Select subject..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {availableSubjects.map(s => <SelectItem key={s.id} value={s.id} className="rounded-xl">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Chapter Name</label>
                  <Input
                    type="text"
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    placeholder="e.g. Introduction"
                    required
                    className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Chapter No.</label>
                  <Input
                    type="number"
                    value={newChapterNumber}
                    onChange={(e) => setNewChapterNumber(e.target.value)}
                    placeholder="1"
                    className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Description (Optional)</label>
                <Textarea 
                  value={newChapterDescription}
                  onChange={(e) => setNewChapterDescription(e.target.value)}
                  placeholder="Briefly describe what this chapter covers..."
                  className="rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200 min-h-[100px]"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={submitting} className="h-12 w-full sm:w-auto px-12 rounded-2xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Chapter
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Content Section */}
      <Card className="rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border-slate-200/60 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 transition-all">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search chapters..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-950 focus-visible:ring-primary/10 transition-all"
            />
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Filter className="h-3.5 w-3.5" /> Showing {filteredChapters.length} Items
          </div>
        </div>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-amber-600 opacity-50" />
              <p className="font-bold text-xs uppercase tracking-widest opacity-60">Organizing Modules...</p>
            </div>
          ) : filteredChapters.length > 0 ? (
            viewType === "grouped" && !searchQuery ? (
              <Accordion type="multiple" className="w-full">
                {subjects.map((sub) => {
                  const subjectChapters = filteredChapters.filter(c => c.subject_id === sub.id);
                  if (subjectChapters.length === 0) return null;

                  return (
                    <AccordionItem key={sub.id} value={sub.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 px-6">
                      <AccordionTrigger className="hover:no-underline py-6 group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center group-data-[state=open]:bg-amber-600 group-data-[state=open]:text-white transition-colors">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-black text-xl tracking-tight">{sub.name}</h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{getClassNameForSubject(sub.id)} • {subjectChapters.length} Chapters</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-8 pt-2">
                        <DndContext 
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(e) => handleDragEnd(e, sub.id)}
                          modifiers={[restrictToVerticalAxis]}
                        >
                          <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl">
                              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                <TableHead className="font-bold py-4 pl-8 w-20 text-center">Order</TableHead>
                                <TableHead className="font-bold">Chapter Name</TableHead>
                                <TableHead className="font-bold text-right pr-8">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <SortableContext 
                                items={subjectChapters.map(c => c.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                {subjectChapters.map((chapter) => (
                                  <SortableRow 
                                    key={chapter.id} 
                                    chapter={chapter} 
                                    onEdit={openEditDialog} 
                                    onDelete={handleDeleteChapter} 
                                  />
                                ))}
                              </SortableContext>
                            </TableBody>
                          </Table>
                        </DndContext>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                      <TableHead className="font-bold py-5 w-20 text-center pl-8">Order</TableHead>
                      <TableHead className="font-bold py-5">Chapter Title</TableHead>
                      <TableHead className="font-bold">Subject & Context</TableHead>
                      <TableHead className="font-bold text-right pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChapters.map((chapter) => (
                      <TableRow key={chapter.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 border-slate-50 dark:border-slate-800 transition-colors group">
                        <TableCell className="text-center font-black text-slate-300 dark:text-slate-700 text-xl italic pl-8">
                          {chapter.chapter_number || "-"}
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 font-black text-xs">
                              <Bookmark className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-lg text-foreground">{chapter.name}</span>
                              {chapter.description && (
                                <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[400px]">{chapter.description}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{getSubjectName(chapter.subject_id)}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">
                              {getClassNameForSubject(chapter.subject_id)}
                            </span >
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" onClick={() => openEditDialog(chapter)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
                              onClick={() => handleDeleteChapter(chapter.id)}
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
            <div className="py-24 text-center space-y-6 px-10">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                <AlertCircle className="h-10 w-10 text-slate-200 dark:text-slate-700" />
              </div>
              <div className="space-y-2">
                <p className="font-black text-2xl tracking-tight">No chapters found</p>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-sm">
                  {searchQuery ? "Try a different search term or clear the filter." : "Your curriculum breakdown is empty. Start by adding chapters to subjects."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingChapter} onOpenChange={(open) => !open && setEditingChapter(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit Chapter</DialogTitle>
            <DialogDescription>
              Update chapter details and associations.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateChapter}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Academic Level</label>
                  <Select value={editClassId} onValueChange={setEditClassId} required>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200">
                      <SelectValue placeholder="Select class..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {classes.map(c => <SelectItem key={c.id} value={c.id} className="rounded-xl">{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Subject</label>
                  <Select value={editSubjectId} onValueChange={setEditSubjectId} required>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200">
                      <SelectValue placeholder="Select subject..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {editAvailableSubjects.map(s => <SelectItem key={s.id} value={s.id} className="rounded-xl">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <label className="text-sm font-bold ml-1">Chapter Name</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">No.</label>
                  <Input
                    type="number"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Description</label>
                <Textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200 min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updating} className="rounded-2xl h-12 px-8 font-bold">
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
