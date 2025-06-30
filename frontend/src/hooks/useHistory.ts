import { useCallback, useRef } from "react";
import { HistoryAction, NodeType } from "../types";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import { useHistoryAction, useHistorySelector } from "@/stores";

export type HistoryItem = {
  action: HistoryAction;
  data: Node | Edge | undefined;
};

export default function useHistory() {
  const { setHistory } = useHistoryAction();
  const { history } = useHistorySelector();
  const currentIndex = useRef(-1);

  const { setNodes, setEdges } = useReactFlow();

  const addToHistory = useCallback(
    (newState: HistoryItem) => {
      setHistory((prevHistory) => {
        const newHistory = [...prevHistory].slice(0, currentIndex.current + 1);
        newHistory.push(newState);
        currentIndex.current += 1;
        return newHistory;
      });
    },
    [history]
  );

  const addNode = useCallback(
    (node: Node | undefined, shouldAddToHistory = true) => {
      if (node) {
        setNodes((prevNodes) => [
          ...prevNodes.filter((n) => n.type !== NodeType.NewFlow),
          node,
        ]);
        // addNodeToFlow(node);
      }
      if (shouldAddToHistory) {
        addToHistory({
          action: HistoryAction.AddNode,
          data: node,
        });
      }
    },
    [addToHistory, setNodes]
  );

  const addEdge = useCallback(
    (edge: Edge | undefined, shouldAddToHistory = true) => {
      if (edge) setEdges((prevEdges) => prevEdges.concat(edge));
      if (shouldAddToHistory)
        addToHistory({
          action: HistoryAction.AddEdge,
          data: edge,
        });
    },
    [addToHistory, setEdges]
  );

  const removeNode = useCallback(
    (node: Node | undefined, shouldAddToHistory = true) => {
      if (node)
        setNodes((prevNodes) =>
          prevNodes.filter((prevNode) => prevNode.id !== node.id)
        );
      if (shouldAddToHistory)
        addToHistory({
          action: HistoryAction.RemoveNode,
          data: node,
        });
    },
    [addToHistory, setNodes]
  );

  const removeEdge = useCallback(
    (edge: Edge | undefined, shouldAddToHistory = true) => {
      if (edge)
        setEdges((prevEdges) =>
          prevEdges.filter((prevEdge) => prevEdge.id !== edge.id)
        );
      if (shouldAddToHistory)
        addToHistory({
          action: HistoryAction.RemoveEdge,
          data: edge,
        });
    },
    [addToHistory, setEdges]
  );

  const undo = useCallback(() => {
    const canUndo = currentIndex.current > -1;
    if (canUndo) {
      const { action, data } = history[currentIndex.current] || {};

      currentIndex.current -= 1;
      switch (action) {
        case HistoryAction.AddNode: {
          removeNode(data as Node, false);
          break;
        }
        case HistoryAction.AddEdge: {
          removeEdge(data as Edge, false);
          break;
        }
        case HistoryAction.RemoveNode: {
          addNode(data as Node, false);
          break;
        }
        case HistoryAction.RemoveEdge: {
          addEdge(data as Edge, false);
          break;
        }
      }
    }
  }, [addEdge, addNode, history, removeEdge, removeNode]);

  const redo = useCallback(() => {
    const canRedo = currentIndex.current < history.length - 1;

    if (canRedo) {
      currentIndex.current += 1;
      const { action, data } = history[currentIndex.current] || {};
      switch (action) {
        case HistoryAction.AddNode: {
          addNode(data as Node, false);
          break;
        }
        case HistoryAction.AddEdge: {
          addEdge(data as Edge, false);
          break;
        }
        case HistoryAction.RemoveNode: {
          removeNode(data as Node, false);
          break;
        }
        case HistoryAction.RemoveEdge: {
          removeEdge(data as Edge, false);
          break;
        }
      }
    }
  }, [addEdge, addNode, history, removeEdge, removeNode]);

  return { addNode, removeNode, addEdge, removeEdge, undo, redo };
}
