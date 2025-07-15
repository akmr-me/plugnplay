"use client";
import { Download, Play, Rss } from "lucide-react";
import { Button } from "../ui/button";
import { useReactFlow } from "@xyflow/react";
import { useFlowActions, useFlowSelectors } from "@/stores";
import {
  getFlowDetailsByProjectAndFlowId,
  updateWorkFlow,
} from "@/service/flow";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { executeWorkflow } from "@/service/node";
import { filterUnusedEdges } from "@/lib/filterEdges";

export default function PlayNPublishButtonGroup() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { getNodes, getEdges, getViewport } = useReactFlow();
  const { currentFlow, currentProject, needsSave } = useFlowSelectors();
  const { saveWorkflow, setCurrentFlow } = useFlowActions();

  const handleSaveWorkFlow = async () => {
    const token = await getToken();
    if (!token || !user?.id || !currentFlow || !currentProject) return;
    const data = filterUnusedEdges({
      nodes: getNodes(),
      edges: getEdges(),
      viewport: getViewport(),
    });
    console.log("filtered", data);
    const projectId = currentProject?.id;
    const flowId = currentFlow.id;
    try {
      await updateWorkFlow(token, user.id, projectId, flowId, data);
      // Get Work flow and update
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
    }
  };
  const handleRunWorkflow = async () => {
    const token = await getToken();
    if (!token) return;
    if (needsSave) {
      const userConfirmation = confirm(
        "You want to save your changes before running the workflow? Are you sure you want to continue?"
      );
      if (!userConfirmation) return;
    }
    await executeWorkflow(token, currentFlow?.id);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={handleSaveWorkFlow}
        disabled={!needsSave}
      >
        <Download /> Save
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={handleRunWorkflow}
      >
        <Play /> Run Workflow
      </Button>
      {/* <Button variant="outline" size="sm" className="cursor-pointer">
        <Rss /> Publish
      </Button> */}
    </div>
  );
}
