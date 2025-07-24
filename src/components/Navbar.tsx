"use client";

import { Button } from "@/components/ui/button";
import { CircleUserRound, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useRef, useState, useTransition } from "react";
import { logoutAction } from "@/lib/actions";
import type { User } from "@/lib/schema";

interface NavItem {
  name: string;
  href: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: "BOOK", href: "/" },
  { name: "ADMIN", href: "/admin", adminOnly: true },
];

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  // Add shadow on scroll for mobile visual depth
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 2) {
          navRef.current.classList.add("shadow-md");
        } else {
          navRef.current.classList.remove("shadow-md");
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;
  const visibleNavItems = user?.role === "admin"
    ? navItems
    : navItems.filter(item => !item.adminOnly);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <header
      ref={navRef}
      className="bg-white border-b border-neutral-200 sticky top-0 z-30 transition-shadow duration-300"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg" aria-label="Go to home">
            <svg
              className="w-9 h-9 text-primary drop-shadow-sm"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
            </svg>
            <span className="ml-2 text-xl md:text-2xl font-bold text-primary tracking-tight">{process.env.NEXT_PUBLIC_BUSINESS_NAME || "Turf"}</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8" aria-label="Primary">
          {visibleNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`font-semibold px-2 py-2 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive(item.href)
                  ? "text-primary bg-primary/10"
                  : "text-neutral-700 hover:text-primary hover:bg-primary/5"
              }`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="flex items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Account menu">
                  <CircleUserRound className="w-6 h-6 mr-2" />
                  <span className="hidden md:inline text-base font-medium">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} disabled={isPending} className="focus:bg-red-100">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>{isPending ? "Logging out..." : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth" className="flex items-center text-neutral-700 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-2" aria-label="Login or Signup">
              <CircleUserRound className="w-6 h-6 text-neutral-400" />
              <span className="ml-2 hidden md:inline text-base font-medium">Login / Signup</span>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden ml-2 p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Open menu">
                <Menu className="h-7 w-7" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0 bg-white w-full max-w-xs sm:max-w-sm shadow-2xl animate-slideInLeft" style={{ minHeight: '100vh' }}>
              <div className="flex flex-col gap-2 mt-8 px-6">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-lg font-semibold px-4 py-3 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-neutral-700 hover:text-primary hover:bg-primary/5"
                    }`}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
                {user && (
                  <Button 
                    variant="ghost" 
                    className="justify-start px-4 py-3 text-lg font-semibold text-red-500 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    onClick={handleLogout}
                    disabled={isPending}
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    {isPending ? "Logging out..." : "Logout"}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}