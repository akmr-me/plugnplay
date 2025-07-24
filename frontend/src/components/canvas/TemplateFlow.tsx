"use client";

import { useEffect, useRef, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  ColorMode,
  useReactFlow,
  OnNodeDrag,
  useViewport,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { nodeTypes, startNode } from "../../data/nodes";
import { edgeTypes } from "../../data/edges";
import ConnectionLine from "../nodes/ConnectionLine";
import { useTheme } from "next-themes";
import { AppNode, NodeType } from "@/types";
import {
  useFlowActions,
  useFlowSelectors,
  useSettingsActions,
  useSettingsSelectors,
} from "@/stores";
import { createNode, isPointInBox } from "@/lib/flow";
import useHistory from "@/hooks/useHistory";
import FormBuilder from "../nodes/details/FormBuilder";
import useKeyBindings from "@/hooks/useKeyBindings";
import Webhook from "../nodes/details/Webhook";
import ScheduleDetails from "../nodes/details/Schedule";
import HttpRequestDetals from "../nodes/details/HTTPRequests";
import JavascriptEditorDetails from "../nodes/details/JavascriptEditor";
import IfConditionDetails from "../nodes/details/IfCondition";
import GmailDetails from "../nodes/details/Gmail";
import OpenAIDetails from "../nodes/details/AiAgent";
import TextDetails from "../nodes/details/TextDetails";

export default function TemplateFlow() {
  const [selectedNode, setSelectedNode] = useState<
    Node | AppNode | undefined
  >();
  const [nodeDropped, setNodeDropped] = useState(false);
  const { theme } = useTheme();
  const { currentFlow, draggingNodeType } = useFlowSelectors();
  const { addEdgeToFlow, updateFlow } = useFlowActions();
  const { addNode } = useHistory();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    currentFlow?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    currentFlow?.edges || []
  );
  const viewport = useViewport();
  const { showMiniMap, showPanel } = useSettingsSelectors();
  const { updateSettings } = useSettingsActions();
  const {
    screenToFlowPosition,
    getIntersectingNodes,
    viewportInitialized,
    setViewport,
  } = useReactFlow();
  const overlappingNodeRef = useRef<Node | null>(null);
  const draggedNode = useRef<Node | null>(null);

  useKeyBindings();

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
      updateFlow({ ...currentFlow, nodes, edges });
    }
  }, [nodes.length, nodes?.[0]?.type, nodeDropped, selectedNode]);

  // Save Edge

  useEffect(() => {
    updateFlow({ ...currentFlow, nodes, edges });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edges.length, addEdgeToFlow, selectedNode]);

  useEffect(() => {
    if (currentFlow?.nodes) {
      setNodes(currentFlow.nodes);
      setEdges(currentFlow.edges);
      setViewport(currentFlow.viewport);
    }
  }, [currentFlow?.id]);

  // Update Position

  const onNodeDrag: OnNodeDrag = (evt, dragNode) => {
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
  console.log(currentFlow);
  const onNodeDragStart = (evt, dragNode) => {
    draggedNode.current = dragNode;
  };

  const NInputComponent = selectedNode
    ? NodeInputComponent[selectedNode.type]
    : null;
  useEffect(() => {
    if (viewportInitialized) {
      updateFlow({ ...currentFlow, viewport });
    }
  }, [viewport]);

  return (
    <div className="w-full h-h-[calc(100vh-2.75rem)] min-h-[calc(100vh-2.75rem)]">
      <ReactFlow
        nodes={nodes}
        key={currentFlow?.name}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        connectionLineComponent={ConnectionLine}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        defaultViewport={currentFlow?.viewport}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeDragStart={onNodeDragStart}
        colorMode={theme as ColorMode}
      >
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
  [NodeType.OpenAITools]: OpenAIDetails,
  [NodeType.FormTrigger]: FormBuilder,
  [NodeType.WebhookTrigger]: Webhook,
  [NodeType.ScheduleTrigger]: ScheduleDetails,
  [NodeType.HttpProgrammingTools]: HttpRequestDetals,
  [NodeType.JavaScriptProgrammingTools]: JavascriptEditorDetails,
  [NodeType.ConditionalOtherTools]: IfConditionDetails,
  [NodeType.MailOtherTools]: GmailDetails,
  [NodeType.TextOtherTools]: TextDetails,
};
