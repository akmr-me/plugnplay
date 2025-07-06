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

type NodeTooltipProps = {
  children: React.ReactElement; // changed from React.ReactNode
  hoverTrigger?: React.ReactNode;
  node: Node;
};

export default function NodeTooltip({
  children,
  node,
  ...props
}: NodeTooltipProps) {
  const { removeNode } = useHistory();
  const handleRemoveNode = () => {
    console.log("removing node", node);
    removeNode(node);
  };
  return (
    <Tooltip>
      <TooltipTrigger>
        {React.cloneElement(children, { ...props })}
      </TooltipTrigger>
      <TooltipContent onClick={(e) => e.stopPropagation()}>
        {
          <Trash
            color="red"
            className="cursor-pointer"
            onClick={handleRemoveNode}
          />
        }
      </TooltipContent>
    </Tooltip>
  );
}
