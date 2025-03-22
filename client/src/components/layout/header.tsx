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

const Header = () => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <Home className="h-8 w-8 text-primary" />
                <span className="ml-2 text-lg font-semibold text-gray-900">Migrale</span>
              </a>
            </Link>
            {user && (
              <nav className="ml-6 flex space-x-4">
                <Link href="/">
                  <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location === "/" 
                      ? "text-primary bg-primary/10" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}>
                    ホーム
                  </a>
                </Link>
                <Link href="/questionnaire">
                  <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location === "/questionnaire" 
                      ? "text-primary bg-primary/10" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}>
                    アンケート
                  </a>
                </Link>
                <Link href="/tasks">
                  <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location === "/tasks" 
                      ? "text-primary bg-primary/10" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}>
                    タスク
                  </a>
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center">
            {!user ? (
              <>
                <Link href="/auth">
                  <a className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:text-primary-dark">
                    ログイン
                  </a>
                </Link>
                <Link href="/auth">
                  <a className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-dark">
                    新規登録
                  </a>
                </Link>
              </>
            ) : (
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
                  <Link href="/tasks">
                    <DropdownMenuItem>
                      タスク
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={handleLogout}>
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
