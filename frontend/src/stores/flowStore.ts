import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { FlowActions, FlowState } from "@/types/store";
import { AppNode, Flow, NodeType, Project } from "@/types";
import { Edge } from "@xyflow/react";

type FlowStore = FlowState & FlowActions;

export const initialNodes: AppNode[] = [
  {
    id: "starter-node",
    type: NodeType.NewFlow,
    position: { x: 0, y: 0 },
    data: { label: "wire" },
  },
];
const initialEdges = [] satisfies Edge[];

const initialFlows: Flow[] = [
  {
    id: "starter-flow",
    name: "Initial Flow",
    description: "This is the initial flow.",
    nodes: initialNodes,
    edges: initialEdges,
    viewport: { x: 0, y: 0, zoom: 0 },
  },
];

export const initialProjects: Project[] = [
  {
    id: "starter-project",
    name: "Starter Project",
    description: "This is the starter project.",
    flows: initialFlows,
  },
];

const defaultFlow: FlowState = {
  currentProject: null,
  currentFlow: null,
  allProjects: initialProjects,
  templates: [],
  needsSave: false,
};

export const useFlowStore = create<FlowStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...defaultFlow,

        setCurrentProject: (project) => {
          set((state) => {
            state.currentProject = project
              ? JSON.parse(JSON.stringify(project))
              : null;
          });
        },

        setCurrentFlow: (flow) => {
          set((state) => {
            state.currentFlow = flow ? JSON.parse(JSON.stringify(flow)) : null;
          });
        },

        addFlow: (flow) => {
          set((state) => {
            const index = state.allProjects.findIndex(
              (p) => p.id === flow.projectId
            );
            if (index !== -1) {
              // Deep clone to avoid readonly array issues
              state.allProjects[index].flows.push(
                JSON.parse(JSON.stringify(flow))
              );
              state.currentFlow = JSON.parse(JSON.stringify(flow));
            }
          });
        },

        updateFlow: (flow) => {
          set((state) => {
            console.log("update flow called", flow);
            state.needsSave = true;
            const index = state.allProjects.findIndex(
              (p) => p.id === flow.projectId
            );
            if (index !== -1) {
              const flowIndex = state.allProjects[index].flows.findIndex(
                (f) => f.id === flow.id
              );
              if (flowIndex !== -1) {
                state.allProjects[index].flows[flowIndex] = JSON.parse(
                  JSON.stringify(flow)
                );
                state.currentFlow = JSON.parse(JSON.stringify(flow));
              }
            }
          });
        },

        deleteFlow: (projectId, flowId) => {
          set((state) => {
            const projectIndex = state.allProjects.findIndex(
              (p) => p.id === projectId
            );
            if (projectIndex !== -1) {
              state.allProjects = JSON.parse(
                JSON.stringify([
                  ...state.allProjects.map((p, index) =>
                    index === projectIndex
                      ? {
                          ...state.allProjects[projectIndex],
                          flows: state.allProjects[projectIndex].flows.filter(
                            (f) => f.id !== flowId
                          ),
                        }
                      : p
                  ),
                ])
              );
              // If the current flow is deleted, clear it
              state.currentFlow = null;
            }
          });
        },

        clearCurrentFlow: () => {
          set((state) => {
            state.currentFlow = null;
          });
        },

        clearCurrentProject: () => {
          set((state) => {
            state.currentProject = null;
          });
        },

        addProject: (project) => {
          set((state) => {
            state.allProjects = JSON.parse(JSON.stringify(project));
            // state.allProjects.push(JSON.parse(JSON.stringify(project)));
            // state.currentProject = JSON.parse(JSON.stringify(project));
            // if (project.flows.length) {
            //   state.currentFlow = JSON.parse(
            //     JSON.stringify(project.flows?.[0])
            //   );
            // }
          });
        },

        updateProject: (project) => {
          set((state) => {
            const index = state.allProjects.findIndex(
              (p) => p.id === project.id
            );
            if (index !== -1) {
              state.allProjects[index] = JSON.parse(JSON.stringify(project));
            }
          });
        },

        deleteProject: (projectId) => {
          set((state) => {
            state.allProjects = state.allProjects.filter(
              (p) => p.id !== projectId
            );
            if (state.currentProject?.id === projectId) {
              state.currentProject = null;
              state.currentFlow = null;
            }
          });
        },

        setDraggingNodeType: (nodeType) => {
          set((state) => {
            state.draggingNodeType = nodeType;
          });
        },

        // --- Implement missing FlowActions ---
        addTemplate: (template) => {
          set((state) => {
            state.templates.push(JSON.parse(JSON.stringify(template)));
          });
        },

        updateTemplate: (template) => {
          set((state) => {
            const idx = state.templates.findIndex((t) => t.id === template.id);
            if (idx !== -1) {
              state.templates[idx] = JSON.parse(JSON.stringify(template));
            }
          });
        },

        addNodeToFlow: (nodes) => {
          set((state) => {
            if (state.currentFlow) {
              // Check if node has default node then remove it and add
              console.log("updating nodes....", nodes);
              state.currentFlow.nodes = nodes.flatMap((node) => {
                return node.type === NodeType.NewFlow ? [] : node;
              });
              // update all projects
              let currentProject = state.currentProject;
              const currentProjectIndex = state.allProjects.findIndex(
                (p) => p.id === currentProject?.id
              );

              state.allProjects[currentProjectIndex].flows = JSON.parse(
                JSON.stringify(
                  state.allProjects[currentProjectIndex].flows.map((f) => {
                    return f.id === state.currentFlow?.id ? { ...f, nodes } : f;
                  })
                )
              );
            }
          });
        },

        removeNodeFromFlow: (nodeId) => {
          set((state) => {
            if (state.currentFlow) {
              state.currentFlow.nodes = state.currentFlow.nodes.filter(
                (n) => n.id !== nodeId
              );
            }
          });
        },
        save: () => {
          set((state) => {
            state.needsSave = false;
          });
        },
        addEdgeToFlow: (edges) => {
          set((state) => {
            if (state.currentFlow) {
              state.currentFlow.edges = edges;
              //
              const currentProjectIndex = state.allProjects.findIndex(
                (p) => p.id === state.currentFlow?.projectId
              );
              console.log({ currentProjectIndex });
              if (currentProjectIndex !== -1) {
                state.allProjects[currentProjectIndex].flows = JSON.parse(
                  JSON.stringify(
                    state.allProjects[currentProjectIndex].flows.map((f) =>
                      f.id === state.currentFlow?.id ? { ...f, edges } : f
                    )
                  )
                );
              }
            }
          });
        },

        removeEdgeFromFlow: (edgeId) => {
          set((state) => {
            if (state.currentFlow) {
              state.currentFlow.edges = state.currentFlow.edges.filter(
                (e) => e.id !== edgeId
              );
            }
          });
        },
      })),
      { name: "flow-storage" }
    ),
    { name: "flow-store" }
  )
);
