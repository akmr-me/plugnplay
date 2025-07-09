import { useFlowActions, useFlowSelectors } from "@/stores";
import React, { useCallback, useEffect } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "../../ui/sidebar";
import { ChevronDown, ChevronRight, RefreshCcw } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { fetchAllProjects } from "@/service/flow";
import { useAuth, useUser } from "@clerk/nextjs";
import WorkflowSidebarSubMenu from "./WorkflowSidebarSubMenu";
import { Project } from "@/types";

export default function ProjectSidebar() {
  const { allProjects, currentFlow, currentProject } = useFlowSelectors();
  const { setCurrentProject, setCurrentFlow, addProject } = useFlowActions();
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();

  const mappedData = React.useMemo(() => {
    return allProjects?.map((project) => ({
      ...project,
      title: project.name,
      // url: `/projects/${project.id}`,
      url: "#",
      // items: project.flows.map((flow) => ({
      //   ...flow,
      //   title: flow.name,
      //   // url: `/projects/${project.id}/flows/${flow.id}`,
      //   url: "#",
      //   isActive: flow.id === currentFlow?.id, // You can set this based on your routing logic
      // })),
    }));
  }, [allProjects, currentFlow]);

  const handleFetchAllProjects = useCallback(async () => {
    const token = await getToken();
    if (!token || !user?.id) {
      alert("Please login!");
      return;
    }

    const projects = await fetchAllProjects(token, user.id);
    console.log("from effect", { projects });
    if (projects.data) {
      addProject(projects.data);
    }
  }, [getToken, user?.id, addProject]);

  useEffect(() => {
    if (isSignedIn) {
      handleFetchAllProjects();
    }
  }, [isSignedIn, handleFetchAllProjects]);

  const handleGetAllFlows = (projectId: string, project: Project) => {
    const newProject = projectId === currentProject?.id ? null : project;
    setCurrentProject(newProject);
    setCurrentFlow(null);
  };

  console.log({ currentFlow });
  return (
    <SidebarGroup key={"Project"}>
      <SidebarGroupLabel className="sidebar-group-label justify-between cursor-pointer">
        {"Projects"} <RefreshCcw onClick={handleFetchAllProjects} />
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
                    handleGetAllFlows(project.id, project);
                  }}
                >
                  <span className="truncate overflow-hidden whitespace-nowrap flex-1 mr-2 cursor-pointer">
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
                  <WorkflowSidebarSubMenu
                    project={project}
                    handleFetchAllProjects={handleFetchAllProjects}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      ))}
    </SidebarGroup>
  );
}
