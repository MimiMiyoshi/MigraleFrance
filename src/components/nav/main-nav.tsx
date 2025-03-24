"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserNav } from "./user-nav";

export function MainNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link href="/" className="text-xl font-bold">
            Migrale
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            ダッシュボード
          </Link>
          <Link
            href="/tasks"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/tasks") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            タスク一覧
          </Link>
        </div>
        <div className="ml-auto">
          <UserNav />
        </div>
      </div>
    </nav>
  );
}
