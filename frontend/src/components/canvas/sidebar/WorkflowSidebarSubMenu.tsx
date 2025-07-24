"use client";
import { SidebarMenuSub, SidebarMenuSubItem } from "@/components/ui/sidebar";
import CreateProject from "./CreateProject";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Flow, Project } from "@/types";
import { useFlowActions, useFlowSelectors } from "@/stores";
import { useEffect, useState } from "react";
import {
  deleteFlowByProjectAndFlowId,
  deleteProjectById,
  getAllFlowsInProject,
  getFlowDetailsByProjectAndFlowId,
} from "@/service/flow";
import { useAuth, useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type WorkflowSidebarSubMenuProps = {
  project: Project;
  handleFetchAllProjects: () => void;
};

export default function WorkflowSidebarSubMenu({
  project,
  handleFetchAllProjects,
}: WorkflowSidebarSubMenuProps) {
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const params = useParams();
  const [flows, setFlows] = useState<Flow[]>([]);
  const { currentFlow, needsSave } = useFlowSelectors();
  const { setCurrentProject, setCurrentFlow } = useFlowActions();

  const handleDeleteFlow = async (projectId: string, workflowId: string) => {
    if (!projectId || !workflowId) return;
    const userConfirmation = confirm(
      `Are you sure you want to delete this workflow? This action cannot be undone.`
    );
    if (!userConfirmation) return;
    const token = await getToken();
    if (!token || !user?.id) return;
    try {
      const response = await deleteFlowByProjectAndFlowId(
        token,
        user.id,
        workflowId,
        projectId
      );

      if (response.message) {
        getAllFlows();
      }
      // // Optionally, clear the current flow if it was deleted
      if (currentFlow?.id === workflowId) {
        setCurrentFlow(null);
      }
      toast.success("Workflow deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete workflow.", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const token = await getToken();
    if (!token || !user?.id) return;
    try {
      const response = await deleteProjectById(token, user.id, projectId);
      if (response.message) {
        setCurrentProject(null);
        handleFetchAllProjects();
      }
      toast.success("Project deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete project.", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const getFlowDetails = async (projectId: string, workflowId: string) => {
    if (needsSave && params.flowId) {
      const userConfirmation = confirm(
        "Unsaved changes will be lost. Are you sure you want to continue?"
      );
      if (!userConfirmation) {
        return;
      }
    }
    if (currentFlow?.id === workflowId) {
      setCurrentFlow(null);
      router.push(`/canvas/project/${projectId}`);
      return;
    }
    const token = await getToken();
    if (!token || !user?.id) return;
    const response = await getFlowDetailsByProjectAndFlowId(
      token,
      user.id,
      workflowId,
      projectId
    );
    if (response) setCurrentFlow(response);
    router.push(`/canvas/project/${projectId}/flow/${workflowId}`);
  };

  const getAllFlows = async () => {
    const token = await getToken();
    if (!token || !user?.id) return;

    const response = await getAllFlowsInProject(token, user?.id, project.id);

    setFlows(response.data.map((flow) => ({ ...flow, title: flow.name })));
  };
  useEffect(() => {
    if (isSignedIn) getAllFlows();
  }, [project.id, params.projectId, isSignedIn, params.flowId]);

  return (
    <SidebarMenuSub className="" key={"project" + project.id}>
      <div className="flex justify-between">
        <CreateProject
          isCreateProject={false}
          projectName={project.title}
          projectId={project.id}
          key={project.id}
          getAllFlows={getAllFlows}
        />
        {flows?.length === 0 && (
          <>
            <Separator
              orientation="vertical"
              className="my-2 text-black h-4 w-1"
            />
            <Button
              size="sm"
              variant="link"
              className="text-xs text-red-400 p-0"
              onClick={() => {
                handleDeleteProject(project.id);
              }}
            >
              Delete Project
            </Button>
          </>
        )}
      </div>
      {flows?.map((flow) => (
        <SidebarMenuSubItem
          key={flow.id}
          className={"flex items-center justify-between"}
        >
          <>
            <span
              onClick={() => getFlowDetails(project.id, flow.id)}
              // className="dark:text-gray-500"
              className={
                "truncate overflow-hidden whitespace-nowrap flex-1 mr-2 cursor-pointer" +
                (currentFlow && currentFlow.id === flow.id ? " font-bold" : "")
              }
              style={{ maxWidth: "120px" }}
            >
              {flow.name}
            </span>
            <Trash
              color="red"
              className="cursor-pointer"
              size={16}
              onClick={() => handleDeleteFlow(project.id, flow.id)}
            />
          </>
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  );
}
