import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Notification } from "@/types/store";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

interface NotificationActions {
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        notifications: [],
        unreadCount: 0,

        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            read: false,
          };

          set((state) => {
            state.notifications.unshift(newNotification);
            state.unreadCount += 1;
          });

          // Auto-remove after 5 seconds for success/info notifications
          if (notification.type === "success" || notification.type === "info") {
            setTimeout(() => {
              get().removeNotification(newNotification.id);
            }, 5000);
          }
        },

        removeNotification: (id) => {
          set((state) => {
            const index = state.notifications.findIndex((n) => n.id === id);
            if (index !== -1) {
              const notification = state.notifications[index];
              if (!notification.read) {
                state.unreadCount -= 1;
              }
              state.notifications.splice(index, 1);
            }
          });
        },

        markAsRead: (id) => {
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            if (notification && !notification.read) {
              notification.read = true;
              state.unreadCount -= 1;
            }
          });
        },

        markAllAsRead: () => {
          set((state) => {
            state.notifications.forEach((notification) => {
              notification.read = true;
            });
            state.unreadCount = 0;
          });
        },

        clearAll: () => {
          set((state) => {
            state.notifications = [];
            state.unreadCount = 0;
          });
        },
      }))
    ),
    {
      name: "notification-store",
    }
  )
);
