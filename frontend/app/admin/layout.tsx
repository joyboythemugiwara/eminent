"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BarChart3, 
  BookMarked, 
  BookOpen, 
  Bookmark, 
  FileText, 
  LogOut, 
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { fetchApi } from "@/lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Classes", href: "/admin/classes", icon: BookMarked },
    { name: "Subjects", href: "/admin/subjects", icon: BookOpen },
    { name: "Chapters", href: "/admin/chapters", icon: Bookmark },
    { name: "Notes", href: "/admin/notes", icon: FileText },
  ];

  const handleLogout = async () => {
    try {
      await fetchApi("/admin/auth/logout", {
        method: "POST",
      });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout failed", err);
      // Even if API fails, we should try to redirect
      router.push("/admin/login");
    }
  };

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { name, href, isLast: index === pathSegments.length - 1 };
  });

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950">
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-white dark:bg-slate-900 z-30 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 font-bold text-primary">
          <BarChart3 className="h-5 w-5" />
          <span className="text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r transition-transform duration-300 ease-in-out lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-6 border-b dark:border-slate-800">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-primary text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span>Admin Panel</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                  pathname.startsWith(item.href) 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  pathname.startsWith(item.href) ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors rounded-xl font-bold"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 w-full overflow-x-hidden",
        "lg:ml-72"
      )}>
        <div className="min-h-screen p-4 pt-20 md:p-8 lg:p-10 lg:pt-10 max-w-full">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Admin Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Home className="h-3 w-3" />
              <ChevronRight className="h-3 w-3" />
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  <Link href={crumb.href} className={cn(
                    "hover:text-primary transition-colors",
                    crumb.isLast ? "text-primary/70" : ""
                  )}>
                    {crumb.name}
                  </Link>
                  {!crumb.isLast && <ChevronRight className="h-3 w-3" />}
                </div>
              ))}
            </div>

            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
