import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useNotifications } from "../../hooks/use-notifications";
import { NotificationList } from "./notification";
import { useLocation } from "wouter";
import { Badge } from "../ui/badge";

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    dismissNotification,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  // タスクページの該当タスクにナビゲート
  const handleViewTask = (taskId: number) => {
    markAllAsRead();
    setOpen(false);
    setLocation("/tasks");
    // タスクIDを使ってスクロールなどの追加機能を実装可能
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => open && markAllAsRead()}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 max-h-[500px] overflow-y-auto p-0"
      >
        <div className="bg-gray-50 p-3 border-b sticky top-0 z-10 flex justify-between items-center">
          <h3 className="font-semibold text-sm">通知</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllAsRead}
            >
              すべて既読にする
            </Button>
          )}
        </div>
        <NotificationList
          notifications={notifications}
          onDismiss={dismissNotification}
          onMarkAsRead={markAsRead}
          onViewTask={handleViewTask}
        />
      </PopoverContent>
    </Popover>
  );
}
