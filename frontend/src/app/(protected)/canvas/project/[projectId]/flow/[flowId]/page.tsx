"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Canvas from "@/components/canvas";
import { useAuth, useUser } from "@clerk/nextjs";
import { getFlowDetailsByProjectAndFlowId } from "@/service/flow";
import { useFlowActions } from "@/stores";

export default function Page() {
  const params = useParams();
  const flowId = params.flowId as string;
  const projectId = params.projectId as string;

  const { getToken } = useAuth();
  const { user } = useUser();
  const { setCurrentFlow } = useFlowActions();

  useEffect(() => {
    const fetchFlowDetails = async () => {
      const token = await getToken();
      if (!token || !user?.id) return;

      try {
        const response = await getFlowDetailsByProjectAndFlowId(
          token,
          user.id,
          flowId,
          projectId
        );
        if (response) setCurrentFlow(response);
      } catch (error) {
        console.error("Failed to fetch flow details", error);
      }
    };

    if (flowId && projectId) {
      fetchFlowDetails();
    }
  }, [flowId, projectId, getToken, user?.id, setCurrentFlow]);

  return <Canvas />;
}
