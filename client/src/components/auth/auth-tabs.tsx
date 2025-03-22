import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";

interface AuthTabsProps {
  activeTab: "login" | "register";
  setActiveTab: (tab: "login" | "register") => void;
}

const AuthTabs = ({ activeTab, setActiveTab }: AuthTabsProps) => {
  return (
    <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="login">ログイン</TabsTrigger>
        <TabsTrigger value="register">新規登録</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <LoginForm />
      </TabsContent>
      
      <TabsContent value="register">
        <RegisterForm />
      </TabsContent>
    </Tabs>
  );
};

export default AuthTabs;
