"use client";

import { useEffect, useState, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { Class } from "@/types";
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
  Plus, 
  Trash2, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  Search, 
  MoreHorizontal, 
  BookMarked,
  ArrowRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

function SortableRow({ 
  cls, 
  onEdit, 
  onDelete 
}: { 
  cls: Class; 
  onEdit: (cls: Class) => void; 
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: cls.id });

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
      <TableCell className="py-5 pl-8">
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
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs">
            {cls.name.charAt(0)}
          </div>
          <span className="font-bold text-lg text-foreground">{cls.name}</span>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="outline" className="font-mono bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5">
          {cls.slug}
        </Badge>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-black text-slate-300 dark:text-slate-700 text-xl italic">{cls.order_index}</span>
      </TableCell>
      <TableCell className="text-right pr-6">
        <div className="flex justify-end items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
            onClick={() => onEdit(cls)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-xl text-slate-400 hover:text-destructive hover:bg-destructive/5 transition-all"
            onClick={() => onDelete(Number(cls.id))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit state
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editName, setEditName] = useState("");
  const [updating, setUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadClasses = async () => {
    try {
      const res = await fetchApi("/classes");
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      loadClasses();
      hasLoaded.current = true;
    }
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setSubmitting(true);
    try {
      await fetchApi("/admin/classes", {
        method: "POST",
        body: JSON.stringify({ name: newClassName }),
      });
      setNewClassName("");
      setIsAdding(false);
      loadClasses();
      toast.success("Class added successfully");
    } catch (err) {
      toast.error("Failed to add class");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editName.trim()) return;

    setUpdating(true);
    try {
      await fetchApi(`/admin/classes/${editingClass.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName }),
      });
      setEditingClass(null);
      loadClasses();
      toast.success("Class updated successfully");
    } catch (err) {
      toast.error("Failed to update class");
    } finally {
      setUpdating(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setClasses((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Update backend
        const reorderItems = newArray.map((item, index) => ({
          id: item.id,
          order_index: index,
        }));

        fetchApi("/admin/classes/reorder", {
          method: "PATCH",
          body: JSON.stringify({ items: reorderItems }),
        }).catch(err => {
          console.error("Failed to reorder", err);
          loadClasses(); // Revert on failure
        });

        return newArray;
      });
    }
  };

  const openEditDialog = (cls: Class) => {
    setEditingClass(cls);
    setEditName(cls.name);
  };

  const handleDeleteClass = async (id: number) => {
    if (!confirm("Are you sure? This will delete all subjects and notes in this class.")) return;

    try {
      await fetchApi(`/admin/classes/${id}`, { method: "DELETE" });
      loadClasses();
      toast.success("Class deleted successfully");
    } catch (err) {
      toast.error("Failed to delete class");
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 px-1 md:px-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px]">
            <BookMarked className="h-3 w-3" />
            Curriculum Management
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Academic Classes</h1>
          <p className="text-muted-foreground text-sm md:text-base">Define and organize your primary education levels.</p>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)} 
          variant={isAdding ? "outline" : "default"}
          className="rounded-2xl h-12 font-bold shadow-xl shadow-primary/20 w-full md:w-auto px-8 transition-all active:scale-95"
        >
          {isAdding ? "Cancel" : <><Plus className="mr-2 h-5 w-5" /> New Class</>}
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-none shadow-sm bg-primary/5 dark:bg-primary/10 border border-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-primary font-black text-3xl">{classes.length}</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary/60 mt-1">Total Classes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className="border-primary/20 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 pb-6">
            <CardTitle className="text-lg">Add New Class</CardTitle>
            <CardDescription>Enter the name of the new academic level.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAddClass} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g. Class 10 or Grade A"
                required
                className="flex-1 h-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950 border-slate-200"
              />
              <Button type="submit" disabled={submitting} className="rounded-2xl h-12 font-bold px-10">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Level
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search & Content */}
      <Card className="rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border-slate-200/60 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 transition-all">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name or slug..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-slate-200 bg-slate-50/50 dark:bg-slate-950 focus-visible:ring-primary/10 transition-all"
            />
          </div>
        </div>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary opacity-50" />
              <p className="font-bold text-xs uppercase tracking-widest opacity-60">Syncing Database...</p>
            </div>
          ) : filteredClasses.length > 0 ? (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-950/50">
                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                      <TableHead className="font-bold py-5 pl-8">Academic Level</TableHead>
                      <TableHead className="font-bold hidden md:table-cell">Slug Identifier</TableHead>
                      <TableHead className="font-bold text-center">Display Order</TableHead>
                      <TableHead className="font-bold text-right pr-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <SortableContext 
                      items={filteredClasses.map(c => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredClasses.map((cls) => (
                        <SortableRow 
                          key={cls.id} 
                          cls={cls} 
                          onEdit={openEditDialog} 
                          onDelete={handleDeleteClass} 
                        />
                      ))}
                    </SortableContext>
                  </TableBody>
                </Table>
              </div>
            </DndContext>
          ) : (
            <div className="py-24 text-center space-y-6 px-10">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                <AlertCircle className="h-10 w-10 text-slate-200 dark:text-slate-700" />
              </div>
              <div className="space-y-2">
                <p className="font-black text-2xl tracking-tight">No classes found</p>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {searchQuery ? `We couldn't find any results for "${searchQuery}".` : "Your curriculum is empty. Start by creating your first academic level."}
                </p>
              </div>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="outline" className="rounded-xl font-bold">
                  Clear Search Filter
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Edit Academic Level</DialogTitle>
            <DialogDescription>
              Update the name of this academic class.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateClass}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Class Name</label>
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
