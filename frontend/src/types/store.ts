import { Edge } from "@xyflow/react";
import { Flow, Project } from ".";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: number;
  read: boolean;
}

export interface AppSettings {
  theme: "light" | "dark";
  language?: string;
  notifications?: boolean;
  autoSave: boolean;
  showMiniMap: boolean;
  showPanel: boolean;
  // showSidePanel: boolean;
}

export interface FlowState {
  currentProject: Project | null;
  currentFlow: Flow | null;
  allProjects: Project[];
  templates: Project[];
  draggingNodeType?: string;
  needsSave: boolean;
}

export type FlowActions = {
  setCurrentProject: (project: Project | null) => void;
  setCurrentFlow: (flow: Flow | null) => void;
  addFlow: (flow: Flow) => void;
  updateFlow: (flow: Flow) => void;
  deleteFlow: (projectId: string, flowId: string) => void;
  clearCurrentFlow: () => void;
  clearCurrentProject: () => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  setDraggingNodeType: (nodeType: string) => void;
  addTemplate: (template: Project) => void;
  updateTemplate: (template: Project) => void;
  addNodeToFlow: (nodes: Node[]) => void;
  removeNodeFromFlow: (nodeId: string) => void;
  addEdgeToFlow: (edges: Edge[]) => void;
  removeEdgeFromFlow: (edgeId: string) => void;
  save: () => void;
};
