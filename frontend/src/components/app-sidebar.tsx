"use client";
import * as React from "react";

import { SearchForm } from "@/components/search-form";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import ProjectSidebar from "./canvas/sidebar/ProjectSidebar";
import TemplateSidebar from "./canvas/sidebar/TemplateSidebar";
import SettingsSidebar from "./canvas/sidebar/SettingsSidebar";
import CreateProject from "./canvas/sidebar/CreateProject";

const AppSidebarItems = {
  Projects: ProjectSidebar,
  // Templates: TemplateSidebar,
  Settings: SettingsSidebar,
  Controls: "Controls",
  Help: "Help",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <CreateProject />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {Object.values(AppSidebarItems).map((Value, index) => (
          <Value key={index} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
