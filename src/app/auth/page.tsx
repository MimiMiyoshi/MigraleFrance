import { Metadata } from "next";
import AuthTabs from "@/components/auth/auth-tabs";

export const metadata: Metadata = {
  title: "認証 - Migrale",
  description: "ログインまたは新規登録を行ってください",
};

export default function AuthPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Migrale</h1>
        <p className="mt-2 text-gray-600">
          フランス移住をサポートするプラットフォーム
        </p>
      </div>
      <AuthTabs activeTab="login" setActiveTab={() => {}} />
    </div>
  );
}
