"use client";
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
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
        ...flow,
        title: flow.name,
        // url: `/projects/${project.id}/flows/${flow.id}`,
        url: "#",
        isActive: flow.id === currentFlow?.id,
      })),
    }));
  }, [allProjects, currentFlow]);

  return (
    <SidebarGroup key={"Templates"}>
      <SidebarGroupLabel className="sidebar-group-label">
        {"Templates"}
      </SidebarGroupLabel>
      {mappedData.map((project) => (
        <SidebarGroupContent key={project.id + "templates"}>
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
                  // className="truncate overflow-hidden whitespace-nowrap flex-1 mr-2"
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
                  <SidebarMenuSub className="">
                    {project.items.map((flow) => (
                      <SidebarMenuSubItem
                        key={flow.id + "templates"}
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
