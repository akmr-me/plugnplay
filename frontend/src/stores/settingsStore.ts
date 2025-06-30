import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { AppSettings } from "@/types/store";

interface SettingsState {
  settings: AppSettings;
}

interface SettingsActions {
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

type SettingsStore = SettingsState & SettingsActions;

const defaultSettings: AppSettings = {
  theme: "dark",
  language: "en",
  notifications: true,
  autoSave: true,
  showMiniMap: true,
  showPanel: true,
};

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      immer((set) => ({
        settings: defaultSettings,

        updateSettings: (updates) => {
          set((state) => {
            Object.assign(state.settings, updates);
          });
        },

        resetSettings: () => {
          set((state) => {
            state.settings = { ...defaultSettings };
          });
        },
      })),
      {
        name: "settings-storage",
      }
    ),
    {
      name: "settings-store",
    }
  )
);
