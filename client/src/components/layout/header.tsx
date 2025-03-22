import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/notification-bell";

const Header = () => {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="flex-shrink-0 flex items-center p-0 h-auto hover:bg-transparent"
              onClick={() => setLocation("/")}
            >
              <Home className="h-8 w-8 text-primary" />
              <span className="ml-2 text-lg font-semibold text-gray-900">Migrale</span>
            </Button>
            
            {user && (
              <nav className="ml-6 flex space-x-4">
                <Button
                  variant="ghost"
                  className={`px-3 py-2 h-auto rounded-md text-sm font-medium ${
                    location === "/" 
                      ? "text-primary bg-primary/10" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setLocation("/")}
                >
                  ホーム
                </Button>
                
                <Button
                  variant="ghost"
                  className={`px-3 py-2 h-auto rounded-md text-sm font-medium ${
                    location === "/questionnaire" 
                      ? "text-primary bg-primary/10" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setLocation("/questionnaire")}
                >
                  アンケート
                </Button>
                
                <Button
                  variant="ghost"
                  className={`px-3 py-2 h-auto rounded-md text-sm font-medium ${
                    location === "/tasks" 
                      ? "text-primary bg-primary/10" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setLocation("/tasks")}
                >
                  タスク
                </Button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center">
            {!user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="text-primary hover:text-primary-dark"
                  onClick={() => setLocation("/auth")}
                >
                  ログイン
                </Button>
                <Button 
                  variant="default" 
                  className="ml-2 bg-primary hover:bg-primary-dark"
                  onClick={() => setLocation("/auth")}
                >
                  新規登録
                </Button>
              </>
            ) : (
              <>
                <div className="mr-2">
                  <NotificationBell />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>マイアカウント</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/tasks")}>
                      タスク
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;