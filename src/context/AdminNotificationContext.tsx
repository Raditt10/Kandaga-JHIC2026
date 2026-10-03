"use client";

import React from "react";
import {
  SocketProvider,
  AdminNotificationProvider as CentralAdminNotificationProvider,
  AdminNotificationContext,
  useAdminNotification,
  useSocket,
  getSocket,
  type AdminNotificationContextType,
} from "@/lib/context";

export {
  AdminNotificationContext,
  useAdminNotification,
  useSocket,
  getSocket,
  type AdminNotificationContextType,
};

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      <CentralAdminNotificationProvider>
        {children}
      </CentralAdminNotificationProvider>
    </SocketProvider>
  );
}

export default AdminNotificationProvider;
