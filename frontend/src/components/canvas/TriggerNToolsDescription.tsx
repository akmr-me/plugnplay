"use client";

import { TriggerNode } from "@/data/nodes";
import TriggerIcons from "../nodes/triggers/TriggerIcons";
import { Button } from "../ui/button";
import useNodeDrag from "@/hooks/useNodeDrag";

export default function TriggerNToolsDescription({
  type,
  description,
  name,
}: TriggerNode) {
  const handleDragStart = useNodeDrag(type);

  // const handleDragEnd = () => {
  //   setIsDragging(false);
  // };
  const IconComponent = TriggerIcons[type];
  return (
    <div
      // className="flex gap-4 items-center justify-center"
      draggable
      onDragStart={handleDragStart}
      // onDragEnd={handleDragEnd}
      className={`flex gap-4 items-center justify-center cursor-pointer grabbable`}
    >
      <Button variant={"ghost"} size={"icon"}>
        <IconComponent />
      </Button>
      <div className="details">
        <h2 className="text-lg font-bold">{name} </h2>
        <p className="text-gray-600">
          {description || "No description available for this type."}
        </p>
      </div>
    </div>
  );
}
