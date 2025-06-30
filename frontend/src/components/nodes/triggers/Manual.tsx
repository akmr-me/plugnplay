"use client";
import { Button } from "@/components/ui/button";
import { Node, NodeProps, Position } from "@xyflow/react";
// import Terminal from "./Terminal";
import { NodeData } from "@/types";

import Terminal from "../Terminal";
import NodeTooltip from "@/components/NodeTooltip";
import TriggerIcons from "./TriggerIcons";

type ManualNode = Node<NodeData, "string">;

export default function Manual({ type, data, ...some }: NodeProps<ManualNode>) {
  const IconComponent = TriggerIcons[type];
  const node = { type, data, ...some } as unknown as Node;

  return (
    <NodeTooltip node={node}>
      <div className="h-12 relative">
        <Button variant="default" className="w-16 h-16">
          {<IconComponent color="green" />}
          <Terminal
            style={{ right: "0%", top: "70%" }}
            type="source"
            position={Position.Right}
            id="right"
          />
        </Button>
        <p className="absolute text-xs left-1/2 -translate-x-1/2">
          Execute workflow{" "}
        </p>
      </div>
    </NodeTooltip>
  );
}
