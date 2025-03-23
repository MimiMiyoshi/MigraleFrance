import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Bell, X, Info, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: "reminder" | "info" | "cultural";
  culturalTheme?: string;
  relatedTaskId?: number;
  dueDate?: string;
  createdAt: string;
  read: boolean;
};

interface NotificationProps {
  notification: NotificationType;
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onViewTask?: (taskId: number) => void;
}

export function NotificationItem({
  notification,
  onDismiss,
  onMarkAsRead,
  onViewTask,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  // アニメーションを適用して通知を閉じる
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case "reminder":
        return <Calendar className="h-5 w-5 text-amber-500" />;
      case "cultural":
        return <Bell className="h-5 w-5 text-indigo-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // 通知の種類によって背景色を変える
  const getBgColor = () => {
    if (!notification.read) {
      switch (notification.type) {
        case "reminder":
          return "bg-amber-50 border-amber-200";
        case "cultural":
          return "bg-indigo-50 border-indigo-200";
        case "info":
        default:
          return "bg-blue-50 border-blue-200";
      }
    }
    return "bg-gray-50 border-gray-200";
  };

  // 期限がある場合は表示
  const renderDueDate = () => {
    if (notification.dueDate) {
      return (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">期限: </span>
          {format(new Date(notification.dueDate), "yyyy年MM月dd日", {
            locale: ja,
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      className={`mb-3 border transition-all duration-300 ${getBgColor()} ${
        isVisible
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform -translate-y-2"
      }`}
    >
      <CardHeader className="py-3 px-4 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <CardTitle className="text-base font-medium">
            {notification.title}
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="py-1 px-4">
        <CardDescription className="text-sm text-gray-700">
          {notification.message}
        </CardDescription>
        {renderDueDate()}
        {notification.culturalTheme && (
          <div className="mt-2 text-xs italic text-indigo-600">
            {notification.culturalTheme}
          </div>
        )}
      </CardContent>
      <CardFooter className="py-2 px-4 flex justify-between">
        <div className="text-xs text-gray-500">
          {format(new Date(notification.createdAt), "yyyy/MM/dd HH:mm", {
            locale: ja,
          })}
        </div>
        <div className="flex gap-2">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onMarkAsRead(notification.id)}
            >
              既読にする
            </Button>
          )}
          {notification.relatedTaskId && onViewTask && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onViewTask(notification.relatedTaskId!)}
            >
              タスクを確認
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

interface NotificationListProps {
  notifications: NotificationType[];
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onViewTask?: (taskId: number) => void;
}

export function NotificationList({
  notifications,
  onDismiss,
  onMarkAsRead,
  onViewTask,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-6 text-center text-gray-500">通知はありません</div>
    );
  }

  return (
    <div className="space-y-2 py-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
          onMarkAsRead={onMarkAsRead}
          onViewTask={onViewTask}
        />
      ))}
    </div>
  );
}
