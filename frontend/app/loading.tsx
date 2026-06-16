import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <Loader2 className="h-12 w-12 animate-spin text-primary absolute top-0 left-0 [animation-delay:-0.3s]" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-primary/60">Eminent Tutorials</p>
        <p className="text-xs text-muted-foreground font-medium animate-pulse">Preparing your study materials...</p>
      </div>
    </div>
  );
}
