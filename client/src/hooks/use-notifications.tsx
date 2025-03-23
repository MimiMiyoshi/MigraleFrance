import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { NotificationType } from "../components/notifications/notification";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { v4 as uuidv4 } from "uuid";

// フランスの文化に関連する情報メッセージのリスト
const culturalNotifications = [
  {
    title: "フランス文化のヒント",
    message:
      "フランスでの挨拶は「Bonjour」（ボンジュール）とともに軽いキスを頬に2回（地方によっては3〜4回）交わすのが一般的です。",
    culturalTheme: "💡 フランスでの社交マナー",
  },
  {
    title: "フランス語のフレーズ",
    message:
      "「S'il vous plaît」（シルヴプレ）は「お願いします」という意味です。お店やレストランで使うと印象が良くなります。",
    culturalTheme: "🗣️ 日常会話で使えるフランス語",
  },
  {
    title: "フランスの生活習慣",
    message:
      "フランスでは昼食に2時間かけることも珍しくありません。食事はただの栄養摂取ではなく、重要な社交の時間と考えられています。",
    culturalTheme: "🍷 フランスの食文化",
  },
  {
    title: "公共交通機関のエチケット",
    message:
      "パリのメトロ（地下鉄）では、乗車時に「Navigo」カードか切符を持っていることが必要です。検札が頻繁にあります。",
    culturalTheme: "🚇 パリでの移動手段",
  },
  {
    title: "フランスの祝日",
    message:
      "5月は祝日が多いフランス。5/1（労働の日）、5/8（戦勝記念日）に加え、キリスト教に関連する祝日も多いです。",
    culturalTheme: "📅 フランスの年中行事",
  },
  {
    title: "ビジネスマナー",
    message:
      "フランスのビジネスシーンでは、初対面でも「tu」ではなく「vous」（丁寧な「あなた」）を使うのがマナーです。",
    culturalTheme: "👔 フランスのビジネス文化",
  },
  {
    title: "フランスの住宅事情",
    message:
      "アパート契約時は「Dossier」と呼ばれる書類セット（収入証明、保証人情報など）の提出が求められます。事前に用意しておくとスムーズです。",
    culturalTheme: "🏠 フランスでの住居探し",
  },
  {
    title: "医療システム",
    message:
      "フランスの医療システム「Sécu」（社会保障）は世界でも評価が高く、適切な手続きを行えば医療費の大部分が払い戻されます。",
    culturalTheme: "🏥 フランスの医療制度",
  },
  {
    title: "フランスのカフェ文化",
    message:
      "「Un café, s'il vous plaît」（アン・カフェ・シルヴプレ）でエスプレッソが注文できます。アメリカンコーヒーは「café allongé」と言います。",
    culturalTheme: "☕ カフェでの注文方法",
  },
  {
    title: "市場でのお買い物",
    message:
      "フランスの多くの町では週に1〜2回「marché」（市場）が開かれます。新鮮な食材を買うだけでなく、地元の文化に触れる良い機会です。",
    culturalTheme: "🥖 地元の市場文化",
  },
];

// ランダムな文化的通知を生成する関数
const getRandomCulturalNotification = (): Omit<
  NotificationType,
  "id" | "createdAt" | "read"
> => {
  const randomIndex = Math.floor(Math.random() * culturalNotifications.length);
  const notification = culturalNotifications[randomIndex];

  return {
    ...notification,
    type: "cultural",
  };
};

type NotificationContextType = {
  notifications: NotificationType[];
  unreadCount: number;
  addNotification: (
    notification: Omit<NotificationType, "id" | "createdAt" | "read">
  ) => void;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addRandomCulturalNotification: () => void;
  updateTaskReminders: (tasks: any[]) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ユーザーIDに基づいて通知を取得
  const { data: fetchedNotifications } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      if (!user) return [];

      // APIコールをシミュレート - 実際の実装ではサーバーから取得
      // 実際のデータ構造に合わせて調整
      return notifications;
    },
    enabled: !!user,
  });

  // 通知更新のミューテーション
  const updateNotificationsMutation = useMutation({
    mutationFn: async (updatedNotifications: NotificationType[]) => {
      if (!user) return;

      // APIコールをシミュレート - 実際の実装ではサーバーに保存
      setNotifications(updatedNotifications);
      return updatedNotifications;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // 未読の通知数をカウント
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 通知を追加
  const addNotification = (
    notification: Omit<NotificationType, "id" | "createdAt" | "read">
  ) => {
    const newNotification: NotificationType = {
      ...notification,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    const updatedNotifications = [newNotification, ...notifications];
    updateNotificationsMutation.mutate(updatedNotifications);
  };

  // ランダムな文化的通知を追加
  const addRandomCulturalNotification = () => {
    const culturalNotification = getRandomCulturalNotification();
    addNotification(culturalNotification);
  };

  // 通知を削除
  const dismissNotification = (id: string) => {
    const updatedNotifications = notifications.filter((n) => n.id !== id);
    updateNotificationsMutation.mutate(updatedNotifications);
  };

  // 通知を既読にする
  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    updateNotificationsMutation.mutate(updatedNotifications);
  };

  // すべての通知を既読にする
  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({
      ...n,
      read: true,
    }));
    updateNotificationsMutation.mutate(updatedNotifications);
  };

  // タスクに基づいてリマインダーを更新
  const updateTaskReminders = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return;

    // 期限が近づいているタスクを探す（3日以内）
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    tasks.forEach((task) => {
      if (!task.dueDate || task.completed) return;

      const dueDate = new Date(task.dueDate);
      // すでに同じタスクのリマインダーがあるか確認
      const existingReminder = notifications.find(
        (n) => n.type === "reminder" && n.relatedTaskId === task.id
      );

      // 期限が3日以内で、まだリマインダーが作成されていないタスク
      if (dueDate <= threeDaysLater && dueDate >= now && !existingReminder) {
        addNotification({
          title: "期限が近いタスク",
          message: `「${task.title}」の期限が近づいています。`,
          type: "reminder",
          relatedTaskId: task.id,
          dueDate: task.dueDate,
        });
      }
    });
  };

  // APIからの通知を初期化
  useEffect(() => {
    if (fetchedNotifications) {
      setNotifications(fetchedNotifications);
    }
  }, [fetchedNotifications]);

  // 最初のログイン時に文化的通知を表示
  useEffect(() => {
    if (user && notifications.length === 0) {
      addRandomCulturalNotification();
    }
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        dismissNotification,
        markAsRead,
        markAllAsRead,
        addRandomCulturalNotification,
        updateTaskReminders,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
