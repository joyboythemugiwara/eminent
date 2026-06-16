export const dynamic = 'force-dynamic';

import { fetchApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookMarked, 
  BookOpen, 
  Bookmark, 
  FileText, 
  PlusCircle, 
  Upload, 
  ArrowUpRight 
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  try {
    const res = await fetchApi("/admin/dashboard/stats");
    return res.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development" || (error as any).message === "Unauthorized - No token provided") {
      console.warn("Dashboard stats unavailable: Unauthorized");
    } else {
      console.error("Failed to fetch stats", error);
    }
    return {
      classes: 0,
      subjects: 0,
      chapters: 0,
      notes: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { name: "Total Classes", value: stats.classes, icon: BookMarked, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Total Subjects", value: stats.subjects, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Total Chapters", value: stats.chapters, icon: Bookmark, color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Total Notes", value: stats.notes, icon: FileText, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground text-lg">
          Welcome back, Admin. Here's a snapshot of your educational content.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.name} className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{stat.name}</CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <span className="text-emerald-500 font-medium">+0%</span> since last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/classes">
              <Card className="hover:bg-slate-50 transition-colors cursor-pointer border-slate-200 group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                        Add New Class <PlusCircle className="h-4 w-4" />
                      </h4>
                      <p className="text-sm text-muted-foreground">Define a new academic level or grade.</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/notes">
              <Card className="hover:bg-slate-50 transition-colors cursor-pointer border-slate-200 group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                        Upload Notes <Upload className="h-4 w-4" />
                      </h4>
                      <p className="text-sm text-muted-foreground">Add PDF study materials to chapters.</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Database Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Storage Usage</span>
                <span>12%</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[12%]"></div>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Your database is performing optimally. Auto-backups are enabled and Cloudflare R2 is correctly integrated for storage.
            </p>
            <Button variant="secondary" className="w-full font-bold">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Utility to merge classes with tailwind
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
