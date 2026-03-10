"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut, CalendarDays, MessageSquareWarning, UsersRound, Settings } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navigation = [
    { name: "จองห้องซ้อม", href: "/", icon: CalendarDays },
    { name: "ชุมชนนักดนตรี", href: "/community", icon: UsersRound },
    { name: "แจ้งปัญหา", href: "/complaints", icon: MessageSquareWarning },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold inline-block text-xl tracking-tight text-primary">
              🎵 BUU Music Space
            </span>
          </Link>
          {session && (
            <div className="hidden md:flex gap-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80",
                      isActive ? "text-foreground font-semibold" : "text-foreground/60"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium leading-none">
                  {session.user.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {session.user.email}
                </span>
              </div>
              <img 
                src={session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.name}`} 
                alt="Avatar" 
                className="h-9 w-9 rounded-full ring-2 ring-primary/20"
              />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
