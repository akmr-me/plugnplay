"use client";

import { useFlowActions, useFlowSelectors } from "@/stores";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
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
import { toast } from "sonner";

export default function ProjectSidebar() {
  const params = useParams();
  const { allProjects, currentFlow, currentProject, needsSave } =
    useFlowSelectors();
  const router = useRouter();
  const { setCurrentProject, setCurrentFlow, addProject } = useFlowActions();
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(() => (params.projectId ? true : false));

  const mappedData = React.useMemo(() => {
    return allProjects?.map((project) => ({
      ...project,
      title: project.name,
      // url: `/projects/${project.id}`,
      url: "ca",
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

    if (projects.data) {
      addProject(projects.data);
    }
  }, [getToken, user?.id, addProject]);

  useEffect(() => {
    if (isSignedIn) {
      handleFetchAllProjects();
    }
  }, [isSignedIn, handleFetchAllProjects]);

  const handleOpenChange = (open: boolean, project: Project) => {
    setIsOpen(open);
    if (open) {
      const projectId = project.id;
      setCurrentProject(project);

      setCurrentFlow(null);
      router.push(`/canvas/project/${projectId}`);
    } else {
      if (needsSave) {
        const userConfirmation = confirm(
          "Unsaved changes will be lost. Are you sure you want to continue?"
        );
        if (!userConfirmation) {
          return;
        }
      }
      setCurrentProject(null);
      setCurrentFlow(null);
      router.push(`/canvas`);
    }
  };
  return (
    <SidebarGroup key="Project">
      <SidebarGroupLabel className="sidebar-group-label justify-between cursor-pointer">
        {"Projects"} <RefreshCcw onClick={handleFetchAllProjects} />
      </SidebarGroupLabel>
      {mappedData.map((project) => (
        <SidebarGroupContent key={project.id}>
          <SidebarMenu>
            <Collapsible
              className="group/collapsible"
              open={isOpen && !!params.projectId}
              onOpenChange={(open) => handleOpenChange(open, project)}
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  isActive={params?.projectId === project.id}
                  className="pl-4 flex items-center justify-between cursor-pointer min-w-0"
                >
                  <span className="truncate overflow-hidden whitespace-nowrap flex-1 mr-2 cursor-pointer">
                    {project.title}
                  </span>
                  {params.projectId === project.id ? (
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
