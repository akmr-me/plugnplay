"use client";

import { Download, Play } from "lucide-react";
import { Button } from "../ui/button";
import { useReactFlow } from "@xyflow/react";
import { useFlowActions, useFlowSelectors } from "@/stores";
import {
  getFlowDetailsByProjectAndFlowId,
  updateWorkFlow,
} from "@/service/flow";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
// import { connectToWebSocket, executeWorkflow } from "@/service/node";
import { filterUnusedEdges } from "@/lib/filterEdges";
import FloatingStreamCard, { StreamDataItem } from "./FloatingStreamCard";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function PlayNPublishButtonGroup() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { getNodes, getEdges, getViewport, updateEdgeData, updateNodeData } =
    useReactFlow();
  const { currentFlow, currentProject, needsSave } = useFlowSelectors();
  const { saveWorkflow, setCurrentFlow } = useFlowActions();
  const [isConnected, setIsConnected] = useState(false);
  const [streamData, setStreamData] = useState<StreamDataItem[]>([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const [loading, setLoading] = useState(false);
  const params = useParams();

  const isFlowPage = params?.flowId && params?.projectId;

  const resetStreamData = () => setStreamData([]);

  const handleSaveWorkFlow = async () => {
    const token = await getToken();
    if (!token || !user?.id || !currentFlow || !currentProject) return;

    const data = filterUnusedEdges({
      nodes: getNodes(),
      edges: getEdges(),
      viewport: getViewport(),
    });

    const projectId = currentProject?.id;
    const flowId = currentFlow.id;
    try {
      setLoading(true);
      await updateWorkFlow(token, user.id, projectId, flowId, data);
      const workflow = await getFlowDetailsByProjectAndFlowId(
        token,
        user.id,
        flowId,
        projectId
      );
      setCurrentFlow(workflow);
      saveWorkflow();
      toast.success("Workflow saved successfully!");
    } catch (error) {
      toast.error("Failed to save workflow.", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };
  const connectToWebSocket = (workflowId: string, token: string) => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}ws/${workflowId}?token=${token}`;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
      setIsMinimized(false);
      // Starting message
      const startMessage: StreamDataItem = {
        id: Date.now(),
        title: "Workflow Execution Started",
        description: "The workflow execution has started.",
        timestamp: new Date().toISOString(),
        type: "start",
        details: "No additional details available.",
      };
      setStreamData((prev) => [...prev, startMessage]);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const edges = getEdges();
        const nodes = getNodes();
        if (data?.chunk) {
          const currentNode = Object.keys(data.chunk)[0];
          const currentData = data.chunk[currentNode].state.nodes[currentNode];
          const edge = edges.find((e) => e.source === currentNode);

          if (edge) {
            edges.forEach((e) => {
              if (e.id === edge.id) {
                updateEdgeData(e.id, {
                  activate: true,
                });
              } else {
                updateEdgeData(e.id, {
                  activate: false,
                });
              }
            });
          }

          const newStreamData: StreamDataItem = {
            id: currentData.id + Date.now(),
            title: currentData.type,
            description:
              currentData.data?.description ||
              data.message ||
              "Being processed",
            timestamp: new Date().toISOString(),
            type:
              currentData.type === "text-other-tool"
                ? "output"
                : currentData.type.split("-").at(-1),
            details: JSON.stringify(
              data.chunk?.[currentNode]?.input?.[currentData.type] || {},
              null,
              1
            ),
          };
          setStreamData((prev) => [...prev, newStreamData]);
        } else {
          if (data.error) {
            const nodeId = data?.failed_node_name;
            const node = nodes.find((e) => e.id === nodeId);

            if (node) {
              updateNodeData(nodeId, {
                ...node.data,
                error: data.error || "An error occurred",
              });
            }

            toast.error("Error while running workflow");
            const messageData: StreamDataItem = {
              id: Date.now(),
              title: "Error",
              description: data.message || "No description provided",
              timestamp: new Date().toISOString(),
              type: "error",
              details: data.error || "No details available",
            };
            setStreamData((prev) => [...prev, messageData]);
            setIsConnected(false);
          } else {
            const startOrEnd =
              data.message === "Workflow executed successfully"
                ? "end"
                : "start";
            if (data.message === "Workflow executed successfully") {
              toast.success("Workflow executed successfully");
              nodes.forEach((node) => {
                updateNodeData(node.id, {
                  ...node.data,
                  error: null,
                });
              });
            }
            const messageData: StreamDataItem = {
              id: Date.now(),
              title: startOrEnd,
              description: data.message || "No description provided",
              timestamp: new Date().toISOString(),
              type: startOrEnd || "info",
              details: data.details || "No details available",
            };
            setStreamData((prev) => [...prev, messageData]);
          }
          setIsConnected(false);
          edges.forEach((e) => {
            updateEdgeData(e.id, {
              activate: false,
            });
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        toast.error("Error while processing webflow message", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error", error);
      toast.error("Error while running workflow", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setIsConnected(false);
    };

    return socket;
  };
  const handleRunWorkflow = async () => {
    const token = await getToken();
    if (!token || !currentFlow?.id) return;
    if (needsSave) {
      const userConfirmation = confirm(
        "You want to save your changes before running the workflow? Are you sure you want to continue?"
      );
      if (!userConfirmation) return;
    }
    saveWorkflow();
    // await executeWorkflow(token, currentFlow?.id);
    await connectToWebSocket(currentFlow?.id, token);
    // console.log("WebSocket response:", wsresponse);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={handleSaveWorkFlow}
        disabled={!needsSave || loading}
        loading={loading}
      >
        <Download /> Save
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={handleRunWorkflow}
        disabled={!isFlowPage || isConnected}
        loading={isConnected}
      >
        <Play /> Run Workflow
      </Button>
      {/* <Button variant="outline" size="sm" className="cursor-pointer">
        <Rss /> Publish
      </Button> */}
      <FloatingStreamCard
        isConnected={isConnected}
        streamData={streamData}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        resetStreamData={resetStreamData}
      />
    </div>
  );
}
