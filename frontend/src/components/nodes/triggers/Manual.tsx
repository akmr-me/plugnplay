"use client";
import { Button } from "@/components/ui/button";
import { Node, NodeProps, Position } from "@xyflow/react";
import { NodeData } from "@/types";

import Terminal from "../Terminal";
import NodeTooltip from "@/components/NodeTooltip";
import TriggerIcons from "./TriggerIcons";
import { Play } from "lucide-react";
import { useFlowSelectors } from "@/stores";

type ManualNode = Node<NodeData, "string">;

export default function Manual({ type, data, ...some }: NodeProps<ManualNode>) {
  const IconComponent = TriggerIcons[type];
  const node = { type, data, ...some } as unknown as Node;
  const { currentFlow } = useFlowSelectors();

  const handleExecuteClick = () => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const runButton = buttons.find(
      (button) => button.textContent?.trim() === "Run Workflow"
    );
    console.log("runButton", runButton);

    if (runButton) {
      runButton.click();
    }
  };
  return (
    <div className="h-12 relative">
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
      <Button
        size="sm"
        className="absolute -left-5 top-5 -translate-x-1/2 rotate-90 rounded-full px-3 py-2"
        variant="outline"
        disabled={(currentFlow?.nodes.length || 0) < 2}
        onClick={handleExecuteClick}
      >
        <Play className="w-4 h-4" />
        Execute
      </Button>
    </div>
  );
}
