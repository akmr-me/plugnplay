"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  // addEdge,
  // type OnConnect,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  ColorMode,
  Panel,
  useReactFlow,
  OnNodeDrag,
  useViewport,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { nodeTypes, startNode, TriggerNodeDescription } from "../../data/nodes";
import { edgeTypes } from "../../data/edges";
import ConnectionLine from "../nodes/ConnectionLine";
import { useTheme } from "next-themes";
import Triggers from "./Triggers";
import { AppNode, NodeType } from "@/types";
import {
  useFlowActions,
  useFlowSelectors,
  useSettingsActions,
  useSettingsSelectors,
} from "@/stores";
import { createEdge, createNode, isPointInBox } from "@/lib/flow";
import useHistory from "@/hooks/useHistory";
import Tools from "./Tools";
import ChatBox from "../nodes/details/ChatBox";
import FormBuilder from "../nodes/details/FormBuilder";
import useKeyBindings from "@/hooks/useKeyBindings";
import Webhook from "../nodes/details/Webhook";
import ScheduleDetails from "../nodes/details/Schedule";
import HttpRequestDetals from "../nodes/details/HTTPRequests";
import JavascriptEditorDetails from "../nodes/details/JavascriptEditor";
import IfConditionDetails from "../nodes/details/IfCondition";
import GmailDetails from "../nodes/details/Gmail";

export default function Flow() {
  const [selectedNode, setSelectedNode] = useState<
    Node | AppNode | undefined
  >();
  const [nodeDropped, setNodeDropped] = useState(false);
  const { theme } = useTheme();
  const { currentFlow, draggingNodeType } = useFlowSelectors();
  const { addEdgeToFlow, updateFlow } = useFlowActions();
  const { addNode, addEdge } = useHistory();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    currentFlow?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    currentFlow?.edges || []
  );
  const viewport = useViewport();
  const { showMiniMap, showPanel } = useSettingsSelectors();
  const { updateSettings } = useSettingsActions();
  const { screenToFlowPosition, getIntersectingNodes, viewportInitialized } =
    useReactFlow();
  const overlappingNodeRef = useRef<Node | null>(null);
  const draggedNode = useRef<Node | null>(null);

  useKeyBindings();

  const onConnect = useCallback(
    (connection: Connection) => {
      // Create Edge
      const data = { activate: true };
      const newEdge = createEdge(data, connection);
      addEdge(newEdge);
    },
    [addEdge]
  );

  const isValidConnection = (connection: Edge | Connection) => {
    console.log({ connection });
    const { source, target } = connection;
    // not be able to connect to same node
    if (source == target) return false;
    return true;
  };

  const onNodeClick = (event: React.MouseEvent<Element>, node: AppNode) => {
    setSelectedNode(node);
    if (node.type === NodeType.NewFlow && !showPanel) {
      updateSettings({ showPanel: !showPanel });
    }
  };
  const onPaneClick = () => {
    setSelectedNode(undefined);
  };
  const isDark = theme === "dark";

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const type = draggingNodeType;
    if (!type) return;
    let position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const overLappingNode = currentFlow?.nodes.find((node) => {
      return isPointInBox(
        { x: position.x, y: position.y },
        {
          x: node.position?.x || 0,
          y: node?.position?.y || 0,
          height: node?.measured?.height || 0,
          width: node?.measured?.width || 0,
        }
      );
    });
    if (overLappingNode) {
      const { x, y } = overLappingNode?.position || {
        x: 0,
        y: 0,
      };
      const { x: dragX, y: dragY } = position || {
        x: 0,
        y: 0,
      };
      position = { x: dragX - x, y: dragY - y };
    }

    const node: AppNode = createNode(type, currentFlow?.id || "", position);
    if (node) {
      addNode(node);
    }
  };

  useEffect(() => {
    if (nodes.length === 0) addNode(startNode);
    else {
      // const { nodes = [], edges = [] } = workflow?.toObject() || {};
      console.log("nodes", nodes);
      // const viewport = getViewport();
      console.log("viewport to save", viewport);

      updateFlow({ ...currentFlow, nodes, edges });
    }
  }, [nodes.length, nodes?.[0]?.type, nodeDropped, selectedNode]);

  // Save Edge

  useEffect(() => {
    updateFlow({ ...currentFlow, nodes, edges });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges.length, addEdgeToFlow, selectedNode]);

  // useEffect(() => {
  //   if (currentFlow?.nodes) {
  //     setNodes(currentFlow.nodes);
  //     setEdges(currentFlow.edges);
  //     setViewport(currentFlow.viewport);
  //   }
  // }, [currentFlow?.name]);

  // Update Position

  const onNodeDrag: OnNodeDrag = (evt, dragNode) => {
    console.log("ondtarg start");
    const overlappingNode = getIntersectingNodes(dragNode)?.[0];
    overlappingNodeRef.current = overlappingNode;
  };
  const onNodeDragStop: OnNodeDrag = (evt, dragNode) => {
    setNodeDropped((prev) => !prev);
    if (overlappingNodeRef.current) {
      setNodes((prevNodes) => {
        // const board = prevNodes?.find(
        //   (prevNode) => prevNode.id === dragNode?.id
        // );

        return prevNodes.map((node) => {
          if (node.id === dragNode.id) {
            // const { x, y } = board?.position || { x: 0, y: 0 };
            // const { x: dragX, y: dragY } = dragNode?.position || { x: 0, y: 0 };
            const position = {
              x: draggedNode.current.position.x,
              y: draggedNode.current.position.y,
            };

            return { ...node, position, parentId: undefined };
          }
          return node;
        });
      });
    }
  };
  // console.log(workflow?.toObject());
  const onNodeDragStart = (evt, dragNode) => {
    draggedNode.current = dragNode;
  };
  // const viewport = getViewport();
  console.log("viewport", viewport);

  const shouldShowTools =
    nodes.length >= 1 && nodes.some((n) => n.type !== NodeType.NewFlow);
  const NInputComponent = selectedNode
    ? NodeInputComponent[selectedNode.type]
    : null;

  useEffect(() => {
    console.log(
      "current flow from effect",
      currentFlow,
      currentFlow?.viewport,
      viewportInitialized,
      viewport
    );
    if (viewportInitialized) {
      console.log(
        "viewportInitializedviewportInitialized",
        viewportInitialized
      );
      // const { x = 0, y = 0, zoom = 1 } = currentFlow?.viewport || {};
      // setViewport({ x, y, zoom });
      updateFlow({ ...currentFlow, viewport });
      // setViewport(currentFlow?.viewport);
    }
  }, [viewport]);
  const handleEdgeChange = (e, edgeProp) => {
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === edgeProp.id) {
          return { ...edge, style: { stroke: "green" }, selected: true };
        } else {
          return edge;
        }
      })
    );
  };

  const handleEdgeMouseLeave = (e, edge) => {
    setEdges((edges) =>
      edges.map((edg) => {
        if (edg.id === edge.id) {
          return { ...edg, style: { stroke: "red" }, selected: false };
        } else {
          return edg;
        }
      })
    );
  };
  return (
    <div
      className="w-full h-h-[calc(100vh-2.75rem)] min-h-[calc(100vh-2.75rem)]"
      // onKeyDown={handleKeyDown}
    >
      <ReactFlow
        // onInit={setReactFlowInstance}
        nodes={nodes}
        key={currentFlow?.name}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        // fitView
        onEdgeMouseEnter={(e, edge) => handleEdgeChange(e, edge)}
        onEdgeMouseLeave={(e, edge) => handleEdgeMouseLeave(e, edge)}
        connectionLineComponent={ConnectionLine}
        isValidConnection={isValidConnection}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        defaultViewport={currentFlow?.viewport}
        // onReconnectStart={onReconnectStart}
        // onReconnect={onReconnect}
        // onReconnectEnd={onReconnectEnd}
        onNodeDrag={onNodeDrag}
        // onNodeDragStop={onNodeDragStop}
        onNodeDragStop={onNodeDragStop}
        onNodeDragStart={onNodeDragStart}
        colorMode={theme as ColorMode}
        onDelete={(...e) => {
          console.log("onnode", e);
        }}
      >
        <Panel
          position="top-right"
          style={{
            border: "1px solid #ccc",
            padding: 12,
            borderRadius: 12,
            background: isDark ? "black" : "white",
            width: "24rem",
            visibility: showPanel ? "visible" : "hidden",
          }}
        >
          {shouldShowTools ? (
            <Tools tools={TriggerNodeDescription} />
          ) : (
            <Triggers tools={TriggerNodeDescription} />
          )}
        </Panel>
        <Background />
        {showMiniMap && <MiniMap />}
        <Controls />
        <svg>
          <defs>
            <linearGradient id="edge">
              <stop offset="0%" stopColor="#ecff02" />
              <stop offset="100%" stopColor="#f69900" />
            </linearGradient>
          </defs>
        </svg>
      </ReactFlow>
      {selectedNode && NInputComponent && (
        <NInputComponent
          node={selectedNode}
          setSelectedNode={setSelectedNode}
        />
      )}
    </div>
  );
}

const NodeInputComponent = {
  [NodeType.OpenAITools]: ChatBox,
  [NodeType.FormTrigger]: FormBuilder,
  [NodeType.WebhookTrigger]: Webhook,
  [NodeType.ScheduleTrigger]: ScheduleDetails,
  [NodeType.HttpProgrammingTools]: HttpRequestDetals,
  [NodeType.JavaScriptProgrammingTools]: JavascriptEditorDetails,
  [NodeType.ConditionalOtherTools]: IfConditionDetails,
  [NodeType.MailOtherTools]: GmailDetails,
};
