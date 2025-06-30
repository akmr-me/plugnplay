"use client";
import { Button } from "@/components/ui/button";
import { Node, NodeProps, Position } from "@xyflow/react";
import { NodeData } from "@/types";
import NodeTooltip from "@/components/NodeTooltip";

import Terminal from "../../Terminal";
import { AIToolsIcons } from "../../triggers/ToolsIcons";

type GeminiAiNode = Node<NodeData, "string">;

export default function GeminiAI({
  type,
  data,
  ...some
}: NodeProps<GeminiAiNode>) {
  const IconComponent = AIToolsIcons[type] as React.FC;
  const node = { type, ...some, data } as unknown as Node;

  return (
    <NodeTooltip node={node}>
      <div className="h-12 relative">
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
            id="right"
          />
        </Button>
        <p className="absolute text-xs left-1/2 -translate-x-1/2">Gemini AI</p>
      </div>
    </NodeTooltip>
  );
}
