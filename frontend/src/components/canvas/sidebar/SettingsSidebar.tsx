"use client";
import React, { useState } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../ui/sidebar";
import { Settings } from "lucide-react";
import Command from "@/components/Icons/Command";
import Ctrl from "@/components/Icons/Ctrl";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import CredentialManager from "@/components/credential/Manager";
import { Dialog } from "@/components/ui/dialog";
import Link from "next/link";

export default function SettingsSidebar() {
  // const isMac = navigator.userAgent.toLowerCase().includes("mac");
  // const ICON = () => (isMac ? <Command /> : <Ctrl />);
  const ICON = () => <Command />;
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
    Credentails: (
      <div className="flex items-center gap-1">
        🗝️
        {/* <Show /> */}
        <Link href="/canvas/credential" className="flex items-center gap-1">
          Add
        </Link>
      </div>
    ),
  };
  return (
    <SidebarGroup key={"Settings"} className="mt-4">
      <SidebarGroupLabel className="sidebar-group-label flex justify-between">
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
                  {setting}{" "}
                  {SettingsItems[setting as keyof typeof SettingsItems]}
                </a>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function Show() {
  const [show, setShow] = useState(false);
  return (
    <>
      <Button onClick={() => setShow(true)}>Add</Button>
      {show && (
        <Dialog open={show} onOpenChange={setShow}>
          {/* <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]"> */}
          <CredentialManager />
          {/* </div> */}
        </Dialog>
      )}
    </>
  );
}
