import { useFlowActions, useFlowSelectors } from "@/stores";
import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../ui/sidebar";
import { ChevronDown, ChevronRight, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createNewFlow } from "@/lib/flow";
import CreateProject from "./CreateProject";

export default function ProjectSidebar() {
  const { allProjects, currentFlow, currentProject } = useFlowSelectors();
  const { setCurrentProject, setCurrentFlow, deleteProject, deleteFlow } =
    useFlowActions();

  const mappedData = React.useMemo(() => {
    return allProjects.map((project) => ({
      ...project,
      title: project.name,
      // url: `/projects/${project.id}`,
      url: "#",
      items: project.flows.map((flow) => ({
        ...flow,
        title: flow.name,
        // url: `/projects/${project.id}/flows/${flow.id}`,
        url: "#",
        isActive: flow.id === currentFlow?.id, // You can set this based on your routing logic
      })),
    }));
  }, [allProjects, currentFlow]);

  const handleDeleteFlow = (projectId: string, workflowId: string) => {
    if (!projectId || !workflowId) return;
    const userConfirmation = confirm(
      `Are you sure you want to delete this workflow? This action cannot be undone.`
    );
    if (!userConfirmation) return;
    deleteFlow(projectId, workflowId);
    // // Optionally, clear the current flow if it was deleted
    // if (currentFlow?.id === workflowId) {
    //   setCurrentFlow(null);
    // }
  };
  console.log({ currentFlow });
  return (
    <SidebarGroup key={"Project"}>
      <SidebarGroupLabel className="text-blue-500 text-lg">
        {"Projects"}
      </SidebarGroupLabel>
      {mappedData.map((project) => (
        <SidebarGroupContent key={project.id}>
          <SidebarMenuButton
            asChild
            isActive={currentProject?.id === project.id}
            className="pl-4!"
          >
            <>
              <a
                href={project.url}
                className="flex items-center justify-between px-4 font-semibold text-ellipsis overflow-hidden whitespace-nowrap"
                onClick={() => {
                  const newProject =
                    project.id === currentProject?.id ? null : project;
                  setCurrentProject(newProject);
                  setCurrentFlow(null); // Clear current flow when switching projects
                }}
              >
                {project.title}{" "}
                {currentProject?.id === project.id ? (
                  <ChevronDown />
                ) : (
                  <ChevronRight />
                )}
              </a>
            </>
          </SidebarMenuButton>
          {currentProject?.id === project.id && (
            <SidebarMenu className="px-2 bg-amber-50 m-auto w-[80%]">
              <div className="flex justify-between">
                <CreateProject
                  isCreateProject={false}
                  projectName={project.title}
                  projectId={project.id}
                  key={project.id}
                />
                {project.items.length === 0 && (
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
                        deleteProject(project.id);
                        setCurrentProject(null);
                      }}
                    >
                      Delete Project
                    </Button>
                  </>
                )}
              </div>
              {project.items.map((flow) => (
                <SidebarMenuSubItem
                  key={flow.id}
                  className="flex items-center justify-between"
                >
                  <SidebarMenuSubButton asChild isActive={flow.isActive}>
                    <>
                      <a
                        href={flow.url}
                        onClick={() => setCurrentFlow(flow)}
                        className="dark:text-gray-500"
                      >
                        {flow.title}
                      </a>
                      <Trash
                        color="red"
                        className="cursor-pointer"
                        size={16}
                        onClick={() => handleDeleteFlow(project.id, flow.id)}
                      />
                    </>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenu>
          )}
        </SidebarGroupContent>
      ))}
    </SidebarGroup>
  );
}
