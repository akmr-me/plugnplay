"use client";
import React, { useEffect, useState } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuSub,
} from "../../ui/sidebar";
import { RefreshCcw, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { deleteTemplate, getTemplates } from "@/service/node";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function TemplateSidebar() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const params = useParams();
  const [templates, setTemplates] = useState([]);

  const getAndSetTemplates = async () => {
    const token = await getToken();
    if (!token) return;
    const response = await getTemplates(token, user?.id);
    if (response.data) {
      setTemplates(response.data);
    }
    console.log("templates", { response });
  };
  useEffect(() => {
    getAndSetTemplates();
  }, []);

  const handleDeleteTemplate = async (id: string) => {
    const token = await getToken();
    if (!token || !user?.id) return;
    const userConfirmation = confirm(
      "Are you sure you want to delete this template? This action cannot be undone."
    );
    if (!userConfirmation) return;
    try {
      await deleteTemplate(token, user?.id, id);
      toast.success("Template deleted successfully!");
      await getAndSetTemplates();
    } catch (error) {
      toast.error("Failed to delete template.");
    }
  };

  return (
    <SidebarGroup key={"Templates"}>
      <SidebarGroupLabel className="sidebar-group-label justify-between cursor-pointer">
        {"Templates"}
        <RefreshCcw onClick={getAndSetTemplates} />
      </SidebarGroupLabel>
      {templates.map((template) => (
        <SidebarGroupContent key={template.id + "templates"}>
          <SidebarMenu>
            <Collapsible className="group/collapsible" open>
              <CollapsibleContent className="flex justify-between items-center">
                <Link
                  href={`/canvas/template/${template.id}`}
                  className={
                    template.id === params.templateId ? "font-bold" : ""
                  }
                >
                  <SidebarMenuSub className="">{template.name}</SidebarMenuSub>
                </Link>
                {template.is_user_creator && (
                  <Trash2
                    size={16}
                    color="red"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="cursor-pointer"
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
