export type NotificationCategory = "all" | "project" | "mitra" | "curation" | "security";
export type NotificationItemCategory = "project" | "mitra" | "curation" | "security";

export type NotificationType =
  | "project_created"
  | "project_updated"
  | "company_registered"
  | "curation_review"
  | "security_alert"
  | "system_info";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  category: "project" | "mitra" | "curation" | "security";
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  priority?: "normal" | "urgent" | "success";
  metadata?: {
    projectId?: string;
    projectTitle?: string;
    studentName?: string;
    companyName?: string;
    actor?: string;
    url?: string;
    badgeText?: string;
  };
}

export type SocketConnectionStatus = "connected" | "connecting" | "disconnected";
