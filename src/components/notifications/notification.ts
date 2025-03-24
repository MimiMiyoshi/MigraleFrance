export type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: "cultural" | "reminder" | "system";
  createdAt: string;
  read: boolean;
  culturalTheme?: string;
  relatedTaskId?: string;
  dueDate?: string;
};
