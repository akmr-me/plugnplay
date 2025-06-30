import EdgeComponent from "@/components/nodes/Edge";
import type { Edge, EdgeTypes } from "@xyflow/react";

export const initialEdges = [
  { id: "a->c", source: "a", target: "c", animated: true },
  { id: "b->d", source: "b", target: "d" },
  { id: "c->d", source: "c", target: "d", animated: true, type: "edge" },
  { id: "new->c", source: "new", target: "c" },
] satisfies Edge[];

export const edgeTypes = {
  edge: EdgeComponent,
  // Add your custom edge types here!
} satisfies EdgeTypes;
