"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { Trash2 as Trash } from "lucide-react";
import { Node } from "@xyflow/react";
import useHistory from "@/hooks/useHistory";
import { NodeType } from "@/types";
import { deleteForm, deleteSchedule } from "@/service/node";
import { useAuth } from "@clerk/nextjs";
import { useFlowSelectors } from "@/stores";
import { toast } from "sonner";
import { useParams } from "next/navigation";

type NodeTooltipProps = {
  children: React.ReactElement; // changed from React.ReactNode
  hoverTrigger?: React.ReactNode;
  node: Node;
};

const NODE_TYPE_DELETE_URL_OBJECT = {
  [NodeType.ScheduleTrigger]: deleteSchedule,
  [NodeType.FormTrigger]: deleteForm,
};

export default function NodeTooltip({
  children,
  node,
  ...props
}: NodeTooltipProps) {
  const { removeNode } = useHistory();
  const { getToken } = useAuth();
  const { currentFlow } = useFlowSelectors();
  const params = useParams();

  const handleRemoveNode = async () => {
    if (params.templateId) {
      toast.error("Cannot delete node in template", {
        description: "You can always fork the template!",
      });
      return;
    }
    const token = await getToken();
    if (!token) return;
    try {
      console.log("removing node", node, currentFlow);
      await NODE_TYPE_DELETE_URL_OBJECT[node.type]?.(token, currentFlow.id);
      removeNode(node);
      toast.success("Node deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete node.", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        {React.cloneElement(children, { ...props })}
      </TooltipTrigger>
      {!params.templateId && (
        <TooltipContent onClick={(e) => e.stopPropagation()}>
          <Trash
            color="red"
            className="cursor-pointer"
            onClick={handleRemoveNode}
          />
        </TooltipContent>
      )}
    </Tooltip>
  );
}
