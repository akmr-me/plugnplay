"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import Canvas from "@/components/canvas";
import { getTemplate } from "@/service/node";
import { useAuth, useUser } from "@clerk/nextjs";
import { useFlowActions, useFlowSelectors } from "@/stores";
import TemplateFlow from "@/components/canvas/TemplateFlow";

export default function Page() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const params = useParams();
  const { setCurrentFlow, setCurrentProject } = useFlowActions();
  const { currentFlow } = useFlowSelectors();

  useEffect(() => {
    const getAndSetTemplates = async () => {
      const token = await getToken();
      if (!token || !user) return;
      console.log({ token, user });
      const response = await getTemplate(token, user?.id, params.templateId);
      console.log("templates", { response });
      setCurrentProject({
        name: "Template",
        id: "template",
        description: "Template project",
        flows: [],
      });
      setCurrentFlow(response);
    };
    console.log("Template ID:", params.templateId);
    getAndSetTemplates();
  }, [params.templateId]);
  console.log("Template ID:", params.templateId, currentFlow);

  return params.templateId === currentFlow?.id ? (
    <TemplateFlow />
  ) : (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground pr-1">No template selected.🚫</p>
    </div>
  );
}
