"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchApi } from "@/lib/api";
import { SearchResults } from "@/types";
import Link from "next/link";
import { Search as SearchIcon, BookOpen, Bookmark, BookMarked, Loader2, ArrowRight } from "lucide-react";

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetchApi(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = results && (
    results.classes.length > 0 || 
    results.subjects.length > 0 || 
    results.chapters.length > 0
  );

  return (
    <div className="space-y-12">
      <div className="py-24 md:py-32">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
              <SearchIcon className="h-6 w-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Search Library
            </h1>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
              Find notes, subjects, or classes instantly
            </p>
          </div>

          <div className="relative group">
            <SearchIcon className="absolute left-6 top-5 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Start typing to discover..."
              className="h-16 pl-16 pr-6 rounded-[2rem] text-xl shadow-2xl shadow-primary/5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-primary/20 transition-all font-medium"
              autoFocus
            />
            {loading && (
              <div className="absolute right-6 top-5">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4">
        {query.trim().length > 0 && !loading && !hasResults && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 shadow-sm animate-in zoom-in-95 duration-300">
            <p className="text-muted-foreground text-lg font-bold text-slate-300">No matches found for "{query}"</p>
          </div>
        )}

        {hasResults && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Classes Results */}
            {results.classes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6 ml-2">
                  <BookMarked className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 text-[10px]">Classes</h2>
                </div>
                <div className="grid gap-4">
                  {results.classes.map((cls) => (
                    <Link key={cls.id} href={`/classes/${cls.slug}`}>
                      <Card className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-slate-200/60 dark:border-slate-800 group rounded-2xl">
                        <CardContent className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                              <BookMarked className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                              {cls.name}
                            </span>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Subjects Results */}
            {results.subjects.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6 ml-2">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 text-[10px]">Subjects</h2>
                </div>
                <div className="grid gap-4">
                  {results.subjects.map((sub) => (
                    <Link key={sub.id} href={`/subjects/${sub.id}/chapters`}>
                      <Card className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-slate-200/60 dark:border-slate-800 group rounded-2xl">
                        <CardContent className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                              <span className="text-xl">{sub.icon || "📖"}</span>
                            </div>
                            <div>
                              <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors block leading-tight">
                                {sub.name}
                              </span>
                              <Badge variant="secondary" className="mt-1 font-bold text-[9px] uppercase tracking-wider h-4">
                                {sub.class_name}
                              </Badge>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Chapters Results */}
            {results.chapters.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6 ml-2">
                  <Bookmark className="h-5 w-5 text-amber-500" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400 text-[10px]">Chapters</h2>
                </div>
                <div className="grid gap-4">
                  {results.chapters.map((chap) => (
                    <Link key={chap.id} href={`/subjects/${chap.subject_id}/chapters`}>
                      <Card className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-slate-200/60 dark:border-slate-800 group rounded-2xl">
                        <CardContent className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                              <Bookmark className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors block leading-tight">
                                {chap.chapter_number ? `${chap.chapter_number}. ` : ""}{chap.name}
                              </span>
                              {chap.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{chap.description}</p>
                              )}
                              <div className="flex gap-2 mt-1.5">
                                <Badge variant="outline" className="font-bold text-[9px] uppercase tracking-wider h-4 border-slate-200">
                                  {chap.subject_name}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
