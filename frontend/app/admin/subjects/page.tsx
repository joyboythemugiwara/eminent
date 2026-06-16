"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { Class, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  BookOpen, 
  Layers,
  ChevronRight,
  Filter,
  LayoutGrid,
  List
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
  subject, 
  onEdit, 
  onDelete 
}: { 
  subject: Subject; 
  onEdit: (sub: Subject) => void; 
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: subject.id });

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
      <TableCell className="py-4 pl-8">
        <div className="flex items-center gap-4">
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 font-black text-[10px]">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="font-bold text-base text-foreground">{subject.name}</span>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <code className="text-[10px] bg-slate-100 dark:bg-slate-800 p-1 rounded-md text-slate-400 font-mono">{subject.slug}</code>
      </TableCell>
      <TableCell className="text-right pr-6">
        <div className="flex justify-end items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
            onClick={() => onEdit(subject)}
          >
            <Edit2 className="h-3.5 w-3.4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
            onClick={() => onDelete(subject.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<"grouped" | "flat">("grouped");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  // Edit state
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editName, setEditName] = useState("");
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
      const [classesRes, subjectsRes] = await Promise.all([
        fetchApi("/classes"),
        fetchApi("/admin/subjects/all")
      ]);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
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

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !selectedClassId) return;

    setSubmitting(true);
    try {
      await fetchApi("/admin/subjects", {
        method: "POST",
        body: JSON.stringify({ 
          name: newSubjectName,
          class_id: selectedClassId,
          icon: "📖" 
        }),
      });
      setNewSubjectName("");
      setIsAdding(false);
      loadData();
      toast.success("Subject added successfully");
    } catch (err) {
      toast.error("Failed to add subject");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editName.trim() || !editClassId) return;

    setUpdating(true);
    try {
      await fetchApi(`/admin/subjects/${editingSubject.id}`, {
        method: "PUT",
        body: JSON.stringify({ 
          name: editName,
          class_id: editClassId
        }),
      });
      setEditingSubject(null);
      loadData();
      toast.success("Subject updated successfully");
    } catch (err) {
      toast.error("Failed to update subject");
    } finally {
      setUpdating(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent, classId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const classSubjects = subjects.filter(s => s.class_id === classId);
      const oldIndex = classSubjects.findIndex((i) => i.id === active.id);
      const newIndex = classSubjects.findIndex((i) => i.id === over.id);
      
      const updatedClassSubjects = arrayMove(classSubjects, oldIndex, newIndex);
      
      // Update the main subjects list
      const otherSubjects = subjects.filter(s => s.class_id !== classId);
      const newAllSubjects = [...otherSubjects, ...updatedClassSubjects];
      
      setSubjects(newAllSubjects);

      // Prepare items for backend reorder
      const reorderItems = updatedClassSubjects.map((item, index) => ({
        id: item.id,
        order_index: index,
      }));

      try {
        await fetchApi("/admin/subjects/reorder", {
          method: "PATCH",
          body: JSON.stringify({ items: reorderItems }),
        });
      } catch (err) {
        toast.error("Reorder failed");
        loadData();
      }
    }
  };

  const openEditDialog = (sub: Subject) => {
    setEditingSubject(sub);
    setEditName(sub.name);
    setEditClassId(sub.class_id);
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure? This will delete all chapters and notes in this subject.")) return;

    try {
      await fetchApi(`/admin/subjects/${id}`, { method: "DELETE" });
      loadData();
      toast.success("Subject deleted successfully");
    } catch (err) {
      toast.error("Failed to delete subject");
    }
  };

  const getClassName = (id: string) => {
    return classes.find(c => c.id === id)?.name || "Unknown Class";
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getClassName(s.class_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
            <Layers className="h-3 w-3" />
            Curriculum Management
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Subjects Catalog</h1>
          <p className="text-muted-foreground text-sm md:text-base">Organize academic subjects by level.</p>
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
            className="rounded-2xl h-10 font-bold shadow-xl shadow-emerald-600/10 px-6 transition-all active:scale-95"
          >
            {isAdding ? "Cancel" : <><Plus className="mr-2 h-4 w-4" /> New Subject</>}
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className="border-emerald-600/20 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <CardHeader className="bg-emerald-50/30 dark:bg-emerald-950/20 pb-6 border-b border-emerald-50">
            <CardTitle className="text-lg">Create New Subject</CardTitle>
            <CardDescription>Assign a subject to an existing academic level.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleAddSubject} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Academic Level</label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId} required>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200">
                    <SelectValue placeholder="Select class..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {classes.map(c => <SelectItem key={c.id} value={c.id} className="rounded-xl">{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Subject Name</label>
                <Input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Mathematics"
                  required
                  className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting} className="h-12 w-full rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-10">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Subject
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
              placeholder="Search subjects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-950 focus-visible:ring-primary/10 transition-all"
            />
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Filter className="h-3.5 w-3.5" /> Showing {filteredSubjects.length} Items
          </div>
        </div>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-emerald-600 opacity-50" />
              <p className="font-bold text-xs uppercase tracking-widest opacity-60">Loading Catalog...</p>
            </div>
          ) : filteredSubjects.length > 0 ? (
            viewType === "grouped" && !searchQuery ? (
              <Accordion type="multiple" className="w-full">
                {classes.map((cls) => {
                  const classSubjects = filteredSubjects.filter(s => s.class_id === cls.id);
                  if (classSubjects.length === 0) return null;

                  return (
                    <AccordionItem key={cls.id} value={cls.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 px-6">
                      <AccordionTrigger className="hover:no-underline py-6 group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-data-[state=open]:bg-primary group-data-[state=open]:text-white transition-colors">
                            <Layers className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-black text-xl tracking-tight">{cls.name}</h3>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{classSubjects.length} Subjects</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-8 pt-2">
                        <DndContext 
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(e) => handleDragEnd(e, cls.id)}
                          modifiers={[restrictToVerticalAxis]}
                        >
                          <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl">
                              <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                <TableHead className="font-bold py-4 pl-8">Subject Name</TableHead>
                                <TableHead className="font-bold hidden md:table-cell">Slug</TableHead>
                                <TableHead className="font-bold text-right pr-8">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <SortableContext 
                                items={classSubjects.map(s => s.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                {classSubjects.map((subject) => (
                                  <SortableRow 
                                    key={subject.id} 
                                    subject={subject} 
                                    onEdit={openEditDialog} 
                                    onDelete={handleDeleteSubject} 
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
                      <TableHead className="font-bold py-5 pl-8">Subject Area</TableHead>
                      <TableHead className="font-bold">Academic Class</TableHead>
                      <TableHead className="font-bold hidden md:table-cell">Internal Slug</TableHead>
                      <TableHead className="font-bold text-right pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.map((subject) => (
                      <TableRow key={subject.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 border-slate-50 dark:border-slate-800 transition-colors group">
                        <TableCell className="py-5 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 font-black text-xs">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-lg text-foreground">{subject.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-xl px-4 py-1 font-bold text-xs bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200">
                            {getClassName(subject.class_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg text-slate-400 font-mono">{subject.slug}</code>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all" onClick={() => openEditDialog(subject)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
                              onClick={() => handleDeleteSubject(subject.id)}
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
                <p className="font-black text-2xl tracking-tight">No subjects found</p>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-sm">
                  {searchQuery ? "Try a different search term or clear the filter." : "Your catalog is empty. Assign subjects to classes to get started."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update the name or academic level of this subject.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubject}>
            <div className="grid gap-4 py-4">
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
                <label className="text-sm font-bold ml-1">Subject Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200"
                  required
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
