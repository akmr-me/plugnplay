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
import { Palette, Save, Settings } from "lucide-react";
import Command from "@/components/Icons/Command";
import Ctrl from "@/components/Icons/Ctrl";
import { Switch } from "@/components/ui/switch";

const isMac = navigator.userAgent.toLowerCase().includes("mac");
const ICON = () => (isMac ? <Command /> : <Ctrl />);
const SettingsItems = {
  "Auto Save": (
    <div className="flex items-center gap-1">
      <Switch />
    </div>
  ),
  "Canvas Theme": (
    <div className="flex items-center gap-1">
      <ICON /> + I
    </div>
  ),
  "Show Mini Map": (
    <div className="flex items-center gap-1">
      <ICON /> + M
    </div>
  ),
  "Show Panel": (
    <div className="flex items-center gap-1">
      <ICON /> + O
    </div>
  ),
};

export default function SettingsSidebar() {
  return (
    <SidebarGroup key={"Settings"} className="mt-4">
      <SidebarGroupLabel className="text-orange-500 text-lg flex justify-between">
        {"Settings"} <Settings />
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="pl-4">
          {Object.keys(SettingsItems).map((setting) => (
            <SidebarMenuSubItem key={setting}>
              <SidebarMenuSubButton asChild isActive={true}>
                <a
                  href="#"
                  className="flex items-center justify-between px-4 bg-transparent!"
                >
                  {setting} {SettingsItems[setting]}
                </a>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
