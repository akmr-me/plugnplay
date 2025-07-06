"use client";
import { Button } from "@/components/ui/button";
import { Node, NodeProps, Position } from "@xyflow/react";
import { NodeData } from "@/types";
import NodeTooltip from "@/components/NodeTooltip";

import Terminal from "../../Terminal";
import { OtherToolsIcon } from "../../triggers/ToolsIcons";

type ConditionalNodeProps = Node<NodeData, "string">;

export default function ConditionalNode({
  type,
  data,
  ...some
}: NodeProps<ConditionalNodeProps>) {
  const IconComponent = OtherToolsIcon[type] as React.FC;
  const node = { type, ...some, data } as unknown as Node;

  return (
    <NodeTooltip node={node}>
      <div className="h-12 relative">
        <Button variant="default" className="w-16 h-16">
          {<IconComponent />}
          <Terminal
            style={{ right: "0%", top: "90%" }}
            type="source"
            position={Position.Right}
            id="right-middle"
          />
          <Terminal
            style={{ right: "0%", top: "45%" }}
            type="source"
            position={Position.Right}
            id="right-bottom"
          />
          <Terminal
            style={{ left: "0%", top: "70%" }}
            type="target"
            position={Position.Left}
            id="left-test"
          />
        </Button>
        <p className="absolute text-xs left-1/2 -translate-x-1/2">
          Conditional
        </p>
      </div>
    </NodeTooltip>
  );
}
