import { useFlowActions, useFlowSelectors } from "@/stores";
import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "../../ui/sidebar";
import { ChevronDown, ChevronRight, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CreateProject from "./CreateProject";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
      <SidebarGroupLabel className="sidebar-group-label">
        {"Projects"}
      </SidebarGroupLabel>
      {mappedData.map((project) => (
        <SidebarGroupContent key={project.id + "project"}>
          <SidebarMenu>
            <Collapsible className="group/collapsible">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  isActive={currentProject?.id === project.id}
                  className="pl-4 flex items-center justify-between cursor-pointer min-w-0"
                  onClick={() => {
                    const newProject =
                      project.id === currentProject?.id ? null : project;
                    setCurrentProject(newProject);
                    setCurrentFlow(null);
                  }}
                >
                  <span
                    className="truncate overflow-hidden whitespace-nowrap flex-1 mr-2 cursor-pointer"
                    // style={{ maxWidth: "120px" }} // Adjust based on your design
                  >
                    {project.title}
                  </span>
                  {currentProject?.id === project.id ? (
                    <ChevronDown className="flex-shrink-0" />
                  ) : (
                    <ChevronRight className="flex-shrink-0" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {currentProject?.id === project.id && (
                  <SidebarMenuSub className="" key={"project" + project.id}>
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
                        key={flow.id + "project"}
                        className="flex items-center justify-between"
                      >
                        <>
                          <span
                            onClick={() => setCurrentFlow(flow)}
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
                            onClick={() =>
                              handleDeleteFlow(project.id, flow.id)
                            }
                          />
                        </>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      ))}
    </SidebarGroup>
  );
}
