import { Download, Play, Rss } from "lucide-react";
import { Button } from "../ui/button";
import { useReactFlow } from "@xyflow/react";
import { useFlowSelectors } from "@/stores";
import { updateWorkFlow } from "@/service/flow";
import { useAuth, useUser } from "@clerk/nextjs";

export default function PlayNPublishButtonGroup() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { getNodes, getEdges, getViewport } = useReactFlow();
  const { currentFlow, currentProject } = useFlowSelectors();
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
    const response = await updateWorkFlow(
      token,
      user.id,
      projectId,
      flowId,
      data
    );
    console.log("saved", response);
    console.log(data.edges);
    console.log(data.nodes);
  };
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={handleSaveWorkFlow}
      >
        <Download /> Save
      </Button>
      <Button variant="outline" size="sm" className="cursor-pointer">
        <Play /> Run Workflow
      </Button>
      <Button variant="outline" size="sm" className="cursor-pointer">
        <Rss /> Publish
      </Button>
    </div>
  );
}
