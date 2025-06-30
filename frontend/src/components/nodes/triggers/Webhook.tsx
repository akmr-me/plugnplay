"use client";
import { Button } from "@/components/ui/button";
import { Node, NodeProps, Position } from "@xyflow/react";
import { NodeData } from "@/types";
import Terminal from "../Terminal";
import NodeTooltip from "@/components/NodeTooltip";
import TriggerIcons from "./TriggerIcons";

type WebhookNode = Node<NodeData, "string">;

export default function Webhook({
  type,
  data,
  ...some
}: NodeProps<WebhookNode>) {
  const IconComponent = TriggerIcons[type];
  const node = { type, data, ...some } as unknown as Node;

  return (
    <NodeTooltip node={node}>
      <div className="h-12 relative">
        <Button variant="default" className="w-16 h-16">
          {<IconComponent color="#d73a49" />}
          <Terminal
            style={{ right: "0%", top: "70%" }}
            type="source"
            position={Position.Right}
            id="right"
          />
        </Button>
        <p className="absolute text-xs left-1/2 -translate-x-1/2">
          Webhook Trigger
        </p>
      </div>
    </NodeTooltip>
  );
}
