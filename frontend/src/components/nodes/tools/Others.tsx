"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ClipboardCopy, Mail } from "lucide-react";
import { NotionFill } from "@/components/Icons/Notion";
import { Sleep } from "@/components/Icons/Sleep";
import { NodeType } from "@/types";
import useNodeDrag from "@/hooks/useNodeDrag";
import { Conditional } from "@/components/Icons/Conditional";
import ComingSoonRibon from "@/components/ComingSoonRibon";

const Others = [
  {
    type: NodeType.MailOtherTools,
    icon: Mail,
    label: "Mail",
    component: <p>compoent</p>,
    isDisabled: false,
  },
  {
    type: NodeType.NotionOtherTools,
    icon: NotionFill,
    label: "Notion",
    component: <p>compoent</p>,
    isDisabled: true,
  },
  {
    type: NodeType.SleepOtherTools,
    icon: Sleep,
    label: "Sleep",
    component: <p>compoent</p>,
    isDisabled: true,
  },
  {
    type: NodeType.ConditionalOtherTools,
    icon: Conditional,
    label: "Conditional",
    component: <p>compoent</p>,
    isDisabled: true,
  },
  {
    type: NodeType.TextOtherTools,
    icon: ClipboardCopy,
    label: "Text",
    component: <p>compoent</p>,
    isDisabled: false,
  },
];

function OtherToolItem({ type, icon, label, isDisabled }) {
  const handleDragStart = useNodeDrag(type);
  const IconComponent = icon;
  // const isDisabled = type !== "text-other-tool"; // Replace with actual logic if needed
  const cursorStyle = isDisabled
    ? "cursor-not-allowed opacity-50"
    : "cursor-pointer";
  return (
    <div
      key={type}
      draggable={!isDisabled}
      onDragStart={handleDragStart}
      className={"relative " + cursorStyle}
    >
      <div className={cn(buttonVariants({ variant: "outline" }), "w-16 h-16")}>
        <IconComponent />
      </div>
      <p className="text-xs font-semibold text-center">{label}</p>
      {isDisabled && <ComingSoonRibon />}
    </div>
  );
}

export default function OtherTools() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Others</h2>
      <Separator orientation="horizontal" className="h-2" />
      <div className="flex gap-2">
        {Others.map((item) => {
          return (
            <OtherToolItem
              key={item.type}
              type={item.type}
              icon={item.icon}
              label={item.label}
              isDisabled={item.isDisabled}
            />
          );
        })}
      </div>
    </div>
  );
}
