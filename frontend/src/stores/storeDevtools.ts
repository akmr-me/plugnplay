import { useNotificationStore } from "./notificationStore";
import { useSettingsStore } from "./settingsStore";

export const storeDevtools = {
  // Reset all stores (development only)
  resetAllStores: () => {
    if (process.env.NODE_ENV === "development") {
      //   useAuthStore.getState().logout();
      useNotificationStore.getState().clearAll();
      useSettingsStore.getState().resetSettings();
    }
  },

  // Log current state of all stores
  logStoreStates: () => {
    if (process.env.NODE_ENV === "development") {
      console.group("Store States");
      //   console.log("Auth:", useAuthStore.getState());
      console.log("Notifications:", useNotificationStore.getState());
      console.log("Settings:", useSettingsStore.getState());
      console.groupEnd();
    }
  },
};
