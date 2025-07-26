"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { ChevronDown, ChevronRight, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { useFlowActions, useFlowSelectors } from "@/stores";
import { fetchAllProjects } from "@/service/flow";
import { Project } from "@/types";

import WorkflowSidebarSubMenu from "./WorkflowSidebarSubMenu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
} from "../../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

function ProjectItem({
  project,
  isOpen,
  isActive,
  onToggle,
  children,
}: {
  project: Project;
  isOpen: boolean;
  isActive: boolean;
  onToggle: (open: boolean, project: Project) => void;
  children?: React.ReactNode;
}) {
  return (
    <SidebarGroupContent key={project.id}>
      <SidebarMenu>
        <Collapsible
          className="group/collapsible"
          open={isOpen}
          onOpenChange={(open) => onToggle(open, project)}
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={isActive}
              className="pl-4 flex items-center justify-between cursor-pointer min-w-0"
            >
              <span className="truncate overflow-hidden whitespace-nowrap flex-1 mr-2">
                {project.name}
              </span>
              {isOpen ? (
                <ChevronDown className="flex-shrink-0" />
              ) : (
                <ChevronRight className="flex-shrink-0" />
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>{children}</CollapsibleContent>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroupContent>
  );
}

export default function ProjectSidebar() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();

  const { allProjects, currentProject, needsSave } = useFlowSelectors();
  const { setCurrentProject, setCurrentFlow, addProject } = useFlowActions();

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    () => {
      const id = params?.projectId;
      return typeof id === "string" ? id : null;
    }
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const mappedProjects = useMemo(() => {
    return allProjects?.map((project) => ({
      ...project,
      title: project.name,
      url: `/canvas/projects/${project.id}`,
    }));
  }, [allProjects]);

  const loadProjects = useCallback(async () => {
    setIsRefreshing(true);
    const token = await getToken();
    if (!token || !user?.id) {
      toast.error("Please log in to fetch projects.");
      setIsRefreshing(false);
      return;
    }

    try {
      const projects = await fetchAllProjects(token, user.id);
      if (projects.data) {
        addProject(projects.data);
        const expanded = projects.data.find((p) => p.id === expandedProjectId);
        if (expanded) {
          setCurrentProject(expanded);
        }
      }
    } catch (error) {
      toast.error("Failed to load projects.");
    } finally {
      setIsRefreshing(false);
    }
  }, [getToken, user?.id, addProject, expandedProjectId]);

  useEffect(() => {
    if (isSignedIn) {
      loadProjects();
    }
  }, [isSignedIn, loadProjects]);

  const handleToggleProject = (open: boolean, project: Project) => {
    if (!open && needsSave) {
      const confirmClose = confirm("Unsaved changes will be lost. Continue?");
      if (!confirmClose) return;
    }

    if (open) {
      setExpandedProjectId(project.id);
      setCurrentProject(project);
      setCurrentFlow(null);
      router.push(`/canvas/project/${project.id}`);
    } else {
      setExpandedProjectId(null);
      setCurrentProject(null);
      setCurrentFlow(null);
      router.push(`/canvas`);
    }
  };

  return (
    <SidebarGroup key="Project">
      <SidebarGroupLabel className="sidebar-group-label justify-between cursor-pointer">
        <span>Projects</span>
        <RefreshCcw
          className={`cursor-pointer transition ${
            isRefreshing ? "animate-spin" : ""
          }`}
          onClick={loadProjects}
          title="Refresh Projects"
        />
      </SidebarGroupLabel>

      {mappedProjects.map((project) => {
        const isOpen = expandedProjectId === project.id;
        const isActive = params?.projectId === project.id;

        return (
          <ProjectItem
            key={project.id}
            project={project}
            isOpen={isOpen}
            isActive={isActive}
            onToggle={handleToggleProject}
          >
            {currentProject?.id === project.id && (
              <WorkflowSidebarSubMenu
                project={project}
                handleFetchAllProjects={loadProjects}
              />
            )}
          </ProjectItem>
        );
      })}
    </SidebarGroup>
  );
}
