"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function NavLink({
  href,
  children,
  activeClassName = "text-amber-800 font-semibold",
  inactiveClassName = "text-muted-foreground",
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "hover:text-amber-800 transition-colors",
        isActive ? activeClassName : inactiveClassName
      )}
    >
      {children}
    </Link>
  );
}
