import { initialNodes } from "@/stores/flowStore";
import { uuid } from "./utils";
import { Connection, MarkerType } from "@xyflow/react";

export function createNewProject(projectName: string) {
  return {
    id: "project_" + uuid(),
    name: projectName,
    description: "This is a new project.",
    flows: [],
  };
}

export function createNewFlow(
  flowName: string,
  projectId: string,
  description?: string
) {
  return {
    id: "flow_" + uuid(),
    name: flowName || "New Workflow",
    description: description || "This is a new workflow.",
    nodes: initialNodes,
    edges: [],
    projectId,
  };
}

export const isPointInBox = (
  point: { x: number; y: number },
  box: { x: number; y: number; height: number; width: number }
) => {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
};

export function createNode(
  type: string,
  workflowId: string,
  position: { x: number; y: number }
) {
  return {
    // ...restNodeProperties,
    id: "node_" + Date.now(),
    type,
    position,
    data: { inputs: [], output: {}, state: {}, run: () => {} },
    workflowId,
  };
}

export function createEdge(
  data: Record<string, unknown>,
  connection: Connection,
  type = "edge"
) {
  return {
    ...connection,
    id: "node_" + Date.now(),
    type,
    data,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: "#FFC300",
    },
  };
}
