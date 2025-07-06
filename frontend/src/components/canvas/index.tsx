"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Flow from "./Flow";
import { useFlowSelectors } from "@/stores";
import PlayNPublishButtonGroup from "./PlayNPublishButtonGroup";
import CreateProject from "./sidebar/CreateProject";

export default function Canvas() {
  const { currentFlow, currentProject } = useFlowSelectors();

  return (
    <SidebarProvider>
      <AppSidebar className="border-t-2" />
      <SidebarInset>
        {/* <div className="h-16" /> */}
        <header className="flex h-11 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  {currentProject?.name || "No Project"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {currentFlow && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {currentFlow?.name || "No Workflow"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <PlayNPublishButtonGroup />
        </header>
        {/* <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div> */}
        {currentFlow?.name ? (
          <Flow />
        ) : (
          <>
            <div className="flex h-full items-center justify-center">
              {currentProject?.name ? (
                <>
                  <p className="text-muted-foreground pr-1">
                    No workflow selected. Please select a workflow to continue
                    or
                  </p>
                  <CreateProject
                    isCreateProject={false}
                    projectId={currentProject.id}
                    projectName={currentProject.name}
                    key={currentProject.id}
                  />
                </>
              ) : (
                <>
                  <p className="text-muted-foreground pr-2">
                    No Project selected. Please select a project to continue or
                  </p>
                  <CreateProject />
                </>
              )}
            </div>
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
