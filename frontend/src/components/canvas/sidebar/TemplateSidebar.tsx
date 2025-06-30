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
import { ChevronDown, ChevronRight } from "lucide-react";

export default function ProjectSidebar() {
  const { allProjects, currentFlow, currentProject } = useFlowSelectors();
  const { setCurrentProject, setCurrentFlow } = useFlowActions();

  const mappedData = React.useMemo(() => {
    return allProjects.map((project) => ({
      ...project,
      title: project.name,
      // url: `/projects/${project.id}`,
      url: "#",
      items: project.flows.map((flow) => ({
        title: flow.name,
        // url: `/projects/${project.id}/flows/${flow.id}`,
        url: "#",
        isActive: flow.id === currentFlow?.id, // You can set this based on your routing logic
      })),
    }));
  }, [allProjects, currentFlow]);

  return (
    <SidebarGroup key={"Template"}>
      <SidebarGroupLabel className="text-blue-500 text-lg">
        {"Templates"}
      </SidebarGroupLabel>
      {mappedData.map((project) => (
        <SidebarGroupContent key={project.title}>
          <SidebarMenuButton
            asChild
            isActive={currentProject?.id === project.id}
            className="pl-4!"
          >
            <>
              <a
                href={project.url}
                className="flex items-center justify-between px-4 font-semibold"
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
            <SidebarMenu className="pl-4    ">
              {project.items.map((flow) => (
                <SidebarMenuSubItem key={flow.title}>
                  <SidebarMenuSubButton asChild isActive={flow.isActive}>
                    <a href={flow.url}>{flow.title}</a>
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
