import { useSettingsActions, useSettingsSelectors } from "@/stores";
import { useEffect } from "react";
import useHistory from "./useHistory";
import { useTheme } from "next-themes";

export default function useKeyBindings() {
  const { resetSettings, updateSettings } = useSettingsActions();
  const { undo, redo } = useHistory();
  const { theme, setTheme } = useTheme();
  const {
    autoSave,
    showMiniMap,
    showPanel,
    // theme: canvasTheme,
  } = useSettingsSelectors();

  const isDark = theme === "dark";
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+B (or Cmd+B on Mac)
      if ((event.ctrlKey || event.metaKey) && ["o", "O"].includes(event.key)) {
        event.preventDefault();
        updateSettings({ showPanel: !showPanel });
        return;
      }
      if ((event.ctrlKey || event.metaKey) && ["R", "r"].includes(event.key)) {
        event.preventDefault();
        resetSettings();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && ["m", "M"].includes(event.key)) {
        event.preventDefault();
        updateSettings({ showMiniMap: !showMiniMap });
        return;
      }
      if ((event.ctrlKey || event.metaKey) && ["i", "I"].includes(event.key)) {
        event.preventDefault();
        setTheme(isDark ? "light" : "dark");
        return;
      }
      if ((event.ctrlKey || event.metaKey) && ["z", "Z"].includes(event.key)) {
        event.preventDefault();
        undo();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && ["y", "Y"].includes(event.key)) {
        event.preventDefault();
        redo();
        return;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    showPanel,
    updateSettings,
    showMiniMap,
    resetSettings,
    theme,
    setTheme,
    isDark,
    redo,
    undo,
  ]);
}
