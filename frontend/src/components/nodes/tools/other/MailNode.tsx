"use client";
import { Button } from "@/components/ui/button";
import { Node, NodeProps, Position } from "@xyflow/react";
import { NodeData } from "@/types";
import NodeTooltip from "@/components/NodeTooltip";

import Terminal from "../../Terminal";
import { OtherToolsIcon } from "../../triggers/ToolsIcons";
import ErrorTooltip from "@/components/ErrorTooltip";

type MailNodeProps = Node<NodeData, "string">;

export default function MailNode({
  type,
  data,
  ...some
}: NodeProps<MailNodeProps>) {
  const IconComponent = OtherToolsIcon[type] as React.FC;
  const node = { type, ...some, data } as unknown as Node;
  return (
    <div className="h-12 relative">
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
          <p className="absolute text-xs left-1/2 -translate-x-1/2">Mail</p>
        </div>
      </NodeTooltip>
      {data.error && <ErrorTooltip error={data.error} />}
    </div>
  );
}
