import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { HistoryAction } from "@/types";
import { Edge, Node } from "@xyflow/react";

export type HistoryItem = {
  action: HistoryAction;
  data: Node | Edge | undefined;
};

type HistoryStore = {
  history: HistoryItem[];
  setHistory: (
    history: HistoryItem[] | ((prev: HistoryItem[]) => HistoryItem[])
  ) => void;
};

export const useHistoryStore = create<HistoryStore>()(
  devtools(
    immer((set) => ({
      history: [],
      setHistory: (history) => {
        set((state) => {
          if (typeof history === "function") {
            state.history = history(state.history);
          } else {
            state.history = history;
          }
        });
      },
    })),
    {
      name: "history-store",
    }
  )
);
