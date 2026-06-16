"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Search", href: "/search" },
    { name: "Classes", href: "/classes" },
    { name: "About", href: "/about" },
  ];

  const isAdmin = pathname.startsWith("/admin");

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-xl">
          <GraduationCap className="h-6 w-6" />
          <span className="hidden xs:inline">Eminent Tutorials</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {!isAdmin ? (
            <>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </>
          ) : (
            <>
              <Link
                href="/admin/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                  pathname.startsWith("/admin/dashboard") ? "text-primary" : "text-muted-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Button asChild variant="outline" size="sm">
                <Link href="/" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  View Site
                </Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="mb-8">
                <SheetTitle className="flex items-center gap-2 text-primary">
                  <GraduationCap className="h-6 w-6" />
                  Eminent Tutorials
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-lg font-semibold transition-colors hover:text-primary py-2 border-b border-muted",
                      pathname === link.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
                {isAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className="text-lg font-semibold text-primary py-2 flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/admin/login"
                    className="text-sm text-muted-foreground mt-4 hover:text-primary"
                  >
                    Admin Login
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
