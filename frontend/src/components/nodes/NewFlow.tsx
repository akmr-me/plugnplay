"use client";

import { Node, NodeProps } from "@xyflow/react";
import { NodeData } from "@/types";
import { Button } from "../ui/button";
import TriggerIcons from "./triggers/TriggerIcons";

type Sample1Node = Node<NodeData, "string">;

export default function NewFlow({
  type,
}: // data: { inputs },
NodeProps<Sample1Node>) {
  const IconComponent = TriggerIcons[type];
  return (
    <div className="h-12">
      <Button className="w-16 h-16">
        <IconComponent className="text-xl" />
      </Button>
      <p className="absolute text-xs left-1/2 -translate-x-1/2">
        Start new workflow
      </p>
    </div>
  );
}
