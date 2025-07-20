"use client";
import { Button } from "@/components/ui/button";
import { Node, NodeProps, Position } from "@xyflow/react";
import { NodeData } from "@/types";
import NodeTooltip from "@/components/NodeTooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Terminal from "../../Terminal";
import { AIToolsIcons } from "../../triggers/ToolsIcons";
import { AlertTriangleIcon } from "lucide-react";
import { useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import ErrorTooltip from "@/components/ErrorTooltip";

type OpenAiNode = Node<NodeData, "string">;

export default function OpenAI({ type, data, ...some }: NodeProps<OpenAiNode>) {
  const IconComponent = AIToolsIcons[type] as React.FC;
  const node = { type, ...some, data } as unknown as Node;

  return (
    <div className="h-12 relative">
      <NodeTooltip node={node}>
        <>
          <Button variant="default" className="w-16 h-16">
            {<IconComponent />}
            <Terminal
              style={{ right: "0%", top: "70%" }}
              type="source"
              position={Position.Right}
              id="right"
            />

            <Terminal
              style={{ left: "0%", top: "70%" }}
              type="target"
              position={Position.Left}
              id="left"
            />
          </Button>
          <p className="absolute text-xs left-1/2 -translate-x-1/2">Open AI</p>
        </>
      </NodeTooltip>
      {data.error && <ErrorTooltip error={data.error} />}
    </div>
  );
}
