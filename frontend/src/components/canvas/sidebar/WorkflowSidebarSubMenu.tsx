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

type WorkflowSidebarSubMenuProps = {
  project: Project;
  handleFetchAllProjects: () => void;
};

export default function WorkflowSidebarSubMenu({
  project,
  handleFetchAllProjects,
}: WorkflowSidebarSubMenuProps) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [flows, setFlows] = useState<Flow[]>([]);
  const { allProjects, currentFlow, currentProject } = useFlowSelectors();
  const {
    setCurrentProject,
    setCurrentFlow,
    deleteProject,
    deleteFlow,
    addProject,
  } = useFlowActions();
  const handleDeleteFlow = async (projectId: string, workflowId: string) => {
    if (!projectId || !workflowId) return;
    const userConfirmation = confirm(
      `Are you sure you want to delete this workflow? This action cannot be undone.`
    );
    if (!userConfirmation) return;
    const token = await getToken();
    if (!token || !user?.id) return;
    const response = await deleteFlowByProjectAndFlowId(
      token,
      user.id,
      workflowId,
      projectId
    );
    console.log("delete", response);
    if (response.message) {
      getAllFlows();
    }
    // // Optionally, clear the current flow if it was deleted
    if (currentFlow?.id === workflowId) {
      setCurrentFlow(null);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const token = await getToken();
    if (!token || !user?.id) return;

    const response = await deleteProjectById(token, user.id, projectId);
    if (response.message) {
      setCurrentProject(null);
      handleFetchAllProjects();
    }
  };

  const getFlowDetails = async (projectId: string, workflowId: string) => {
    const token = await getToken();
    if (!token || !user?.id) return;
    const response = await getFlowDetailsByProjectAndFlowId(
      token,
      user.id,
      workflowId,
      projectId
    );
    console.log("workflow deatails", response);
    if (response) setCurrentFlow(response);
  };

  const getAllFlows = async () => {
    const token = await getToken();
    if (!token || !user?.id) return;
    const response = await getAllFlowsInProject(token, user?.id, project.id);
    console.log("fetching again");
    if (response.data.length)
      setFlows(response.data.map((flow) => ({ ...flow, title: flow.name })));
    console.log(response);
  };
  useEffect(() => {
    getAllFlows();
  }, [project.id]);
  console.log({ flows });
  return (
    <SidebarMenuSub className="" key={"project" + project.id}>
      <div className="flex justify-between">
        <CreateProject
          isCreateProject={false}
          projectName={project.title}
          projectId={project.id}
          key={project.id}
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
          className="flex items-center justify-between"
        >
          <>
            <span
              onClick={() => getFlowDetails(project.id, flow.id)}
              // className="dark:text-gray-500"
              className="truncate overflow-hidden whitespace-nowrap flex-1 mr-2 cursor-pointer"
              style={{ maxWidth: "120px" }}
            >
              {flow.title}
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
