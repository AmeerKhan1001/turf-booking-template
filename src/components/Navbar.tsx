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
  { name: "HOME", href: "/" },
  { name: "BOOK", href: "/book" },
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
          navRef.current.classList.add("shadow-lg");
          navRef.current.classList.add("backdrop-blur-md");
        } else {
          navRef.current.classList.remove("shadow-lg");
          navRef.current.classList.remove("backdrop-blur-md");
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
      className="bg-white/95 border-b border-neutral-200/50 sticky top-0 z-40 transition-all duration-300 backdrop-blur-sm"
      role="banner"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-2 hover:bg-primary/5 transition-all duration-200" aria-label="Go to home">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-6 h-6 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
              </svg>
            </div>
            <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">{process.env.NEXT_PUBLIC_BUSINESS_NAME || "Turf"}</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2" aria-label="Primary">
          {visibleNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary hover-lift ${isActive(item.href)
                ? "text-primary bg-primary/10 shadow-sm"
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
                <Button variant="ghost" className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl px-3 py-2 hover:bg-primary/5 transition-all duration-200" aria-label="Account menu">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-2">
                    <CircleUserRound className="w-5 h-5 text-primary" />
                  </div>
                  <span className="hidden md:inline text-base font-medium text-neutral-700">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-2">
                <DropdownMenuLabel className="text-sm font-medium">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} disabled={isPending} className="focus:bg-red-50 text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>{isPending ? "Logging out..." : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth" className="flex items-center text-neutral-700 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl px-3 py-2 hover:bg-primary/5 transition-all duration-200" aria-label="Login or Signup">
              <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center mr-2">
                <CircleUserRound className="w-5 h-5 text-neutral-500" />
              </div>
              <span className="hidden md:inline text-base font-medium">Login / Signup</span>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden ml-3 w-10 h-10 rounded-xl hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200" aria-label="Open menu">
                <Menu className="h-6 w-6 text-neutral-700" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0 bg-white/95 backdrop-blur-md w-full max-w-xs sm:max-w-sm shadow-2xl border-l border-neutral-200/50" style={{ minHeight: '100vh' }}>
              <div className="flex flex-col gap-3 mt-12 px-6">
                {/* Mobile Logo */}
                <div className="flex items-center mb-6 pb-4 border-b border-neutral-200/50">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-primary tracking-tight">{process.env.NEXT_PUBLIC_BUSINESS_NAME || "Turf"}</span>
                </div>

                {/* Navigation Items */}
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-lg font-semibold px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary hover-lift ${isActive(item.href)
                      ? "text-primary bg-primary/10 shadow-sm"
                      : "text-neutral-700 hover:text-primary hover:bg-primary/5"
                      }`}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* User Section */}
                {user && (
                  <div className="mt-6 pt-4 border-t border-neutral-200/50">
                    <div className="flex items-center mb-4 px-4 py-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <CircleUserRound className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-base font-medium text-neutral-700">{user.username}</span>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-4 py-3.5 text-lg font-semibold text-red-600 rounded-xl hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-all duration-200"
                      onClick={handleLogout}
                      disabled={isPending}
                      aria-label="Logout"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      {isPending ? "Logging out..." : "Logout"}
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}