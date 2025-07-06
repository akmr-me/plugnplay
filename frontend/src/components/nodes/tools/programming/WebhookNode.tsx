"use client";
import { Button } from "@/components/ui/button";
import { Node, NodeProps, Position } from "@xyflow/react";
import { NodeData } from "@/types";
import NodeTooltip from "@/components/NodeTooltip";
import Terminal from "../../Terminal";
import { ProgrammingToolsIcon } from "../../triggers/ToolsIcons";

type WebhookNodeProps = Node<NodeData, "string">;

export default function WebhookNode({
  type,
  data,
  ...some
}: NodeProps<WebhookNodeProps>) {
  const IconComponent = ProgrammingToolsIcon[type] as React.FC;
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
            id="left"
          />
        </Button>
        <p className="absolute text-xs left-1/2 -translate-x-1/2">Webhook</p>
      </div>
    </NodeTooltip>
  );
}
