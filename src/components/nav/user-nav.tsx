"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function UserNav() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <span className="text-muted-foreground">ようこそ、</span>
        <span className="font-medium">{session.user.username}</span>
        <span className="text-muted-foreground">さん</span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
      >
        ログアウト
      </button>
    </div>
  );
}
