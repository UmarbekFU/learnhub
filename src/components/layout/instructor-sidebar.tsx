"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { instructorNavItems } from "@/config/nav";
import { Logo } from "@/components/shared/logo";

export function InstructorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Logo />
      </div>
      <div className="px-4 pt-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
          Instructor
        </p>
      </div>
      <nav className="flex-1 space-y-1 p-4 pt-0">
        {instructorNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
