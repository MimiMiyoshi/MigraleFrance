import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../lib/auth";
import Dashboard from "./dashboard-component";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // 未ログインの場合はログインページへリダイレクト
  if (!session) {
    redirect("/login");
  }

  return <Dashboard user={session.user} />;
}
