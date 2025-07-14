import { useFlowStore } from "./flowStore";
import { useHistoryStore } from "./historyStore";
import { useNotificationStore } from "./notificationStore";
import { useSettingsStore } from "./settingsStore";

export const useNotificationSelectors = () => ({
  notifications: useNotificationStore((state) => state.notifications),
  unreadCount: useNotificationStore((state) => state.unreadCount),
  hasUnread: useNotificationStore((state) => state.unreadCount > 0),
});

export const useSettingsSelectors = () => ({
  theme: useSettingsStore((state) => state.settings.theme),
  language: useSettingsStore((state) => state.settings.language),
  notifications: useSettingsStore((state) => state.settings.notifications),
  autoSave: useSettingsStore((state) => state.settings.autoSave),
  showMiniMap: useSettingsStore((state) => state.settings.showMiniMap),
  showPanel: useSettingsStore((state) => state.settings.showPanel),
});

export const useNotificationActions = () => ({
  addNotification: useNotificationStore((state) => state.addNotification),
  removeNotification: useNotificationStore((state) => state.removeNotification),
  markAsRead: useNotificationStore((state) => state.markAsRead),
  markAllAsRead: useNotificationStore((state) => state.markAllAsRead),
  clearAll: useNotificationStore((state) => state.clearAll),
});

export const useSettingsActions = () => ({
  updateSettings: useSettingsStore((state) => state.updateSettings),
  resetSettings: useSettingsStore((state) => state.resetSettings),
});

export const useFlowSelectors = () => ({
  currentProject: useFlowStore((state) => state.currentProject),
  currentFlow: useFlowStore((state) => state.currentFlow),
  allProjects: useFlowStore((state) => state.allProjects),
  templates: useFlowStore((state) => state.templates),
  draggingNodeType: useFlowStore((state) => state.draggingNodeType),
  needsSave: useFlowStore((state) => state.needsSave),
});

export const useFlowActions = () => ({
  setCurrentProject: useFlowStore((state) => state.setCurrentProject),
  setCurrentFlow: useFlowStore((state) => state.setCurrentFlow),
  addFlow: useFlowStore((state) => state.addFlow),
  updateFlow: useFlowStore((state) => state.updateFlow),
  deleteFlow: useFlowStore((state) => state.deleteFlow),
  clearCurrentFlow: useFlowStore((state) => state.clearCurrentFlow),
  clearCurrentProject: useFlowStore((state) => state.clearCurrentProject),
  addProject: useFlowStore((state) => state.addProject),
  updateProject: useFlowStore((state) => state.updateProject),
  deleteProject: useFlowStore((state) => state.deleteProject),
  setDraggingNodeType: useFlowStore((state) => state.setDraggingNodeType),
  addTemplate: useFlowStore((state) => state.addTemplate),
  updateTemplate: useFlowStore((state) => state.updateTemplate),
  addNodeToFlow: useFlowStore((state) => state.addNodeToFlow),
  removeNodeFromFlow: useFlowStore((state) => state.removeNodeFromFlow),
  addEdgeToFlow: useFlowStore((state) => state.addEdgeToFlow),
  removeEdgeFromFlow: useFlowStore((state) => state.removeEdgeFromFlow),
  saveWorkflow: useFlowStore((state) => state.save),
});
export const useHistorySelector = () => ({
  history: useHistoryStore((store) => store.history),
});

export const useHistoryAction = () => ({
  setHistory: useHistoryStore((store) => store.setHistory),
});

// // Cross-store effects and subscriptions
// export const setupStoreSubscriptions = () => {
//   // Subscribe to theme changes and apply to document
//   useSettingsStore.subscribe(
//     (state) => state.settings.theme,
//     (theme) => {
//       if (theme === "dark") {
//         console.log("Applying dark theme");
//       } else if (theme === "light") {
//         console.log("Applying light theme");
//       } else {
//         // System theme
//         const prefersDark = window.matchMedia(
//           "(prefers-color-scheme: dark)"
//         ).matches;
//         document.documentElement.classList.toggle("dark", prefersDark);
//       }
//     }
//   );
// };
