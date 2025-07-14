import { Download, Play, Rss } from "lucide-react";
import { Button } from "../ui/button";
import { useReactFlow } from "@xyflow/react";
import { useFlowActions, useFlowSelectors } from "@/stores";
import { updateWorkFlow } from "@/service/flow";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function PlayNPublishButtonGroup() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { getNodes, getEdges, getViewport } = useReactFlow();
  const { currentFlow, currentProject, needsSave } = useFlowSelectors();
  const { saveWorkflow } = useFlowActions();

  const handleSaveWorkFlow = async () => {
    const token = await getToken();
    if (!token || !user?.id || !currentFlow || !currentProject) return;
    const data = {
      nodes: getNodes(),
      edges: getEdges(),
      viewport: getViewport(),
    };
    const projectId = currentProject?.id;
    const flowId = currentFlow.id;
    try {
      await updateWorkFlow(token, user.id, projectId, flowId, data);
      saveWorkflow();
      toast.success("Workflow saved successfully!");
    } catch (error) {
      toast.error("Failed to save workflow.", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
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
      <Button variant="outline" size="sm" className="cursor-pointer">
        <Play /> Run Workflow
      </Button>
      {/* <Button variant="outline" size="sm" className="cursor-pointer">
        <Rss /> Publish
      </Button> */}
    </div>
  );
}
