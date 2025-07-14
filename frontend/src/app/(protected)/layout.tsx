"use client";
import { ReactFlowProvider } from "@xyflow/react";
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
import PlayNPublishButtonGroup from "@/components/canvas/PlayNPublishButtonGroup";
import { useFlowSelectors } from "@/stores";

export default function WithoutHeaderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { currentFlow, currentProject } = useFlowSelectors();
  return (
    <>
      <div id="dialog-portal" className="absolute z-[9999]"></div>
      <SidebarProvider>
        <ReactFlowProvider>
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
            {children}
          </SidebarInset>
        </ReactFlowProvider>
      </SidebarProvider>
    </>
  );
}
// "use client";
// import Canvas from "@/components/canvas";
// import { ReactFlowProvider } from "@xyflow/react";

// export default function Page() {
//   return (
//     <ReactFlowProvider>
//       <Canvas />
//     </ReactFlowProvider>
//   );
// }
// // test
