"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";
import { NotionFill } from "@/components/Icons/Notion";
import { Sleep } from "@/components/Icons/Sleep";
import { NodeType } from "@/types";
import useNodeDrag from "@/hooks/useNodeDrag";
import { Conditional } from "@/components/Icons/Conditional";

const Others = [
  {
    type: NodeType.MailOtherTools,
    icon: Mail,
    label: "Mail",
    component: <p>compoent</p>,
  },
  {
    type: NodeType.NotionOtherTools,
    icon: NotionFill,
    label: "Notion",
    component: <p>compoent</p>,
  },
  {
    type: NodeType.SleepOtherTools,
    icon: Sleep,
    label: "Sleep",
    component: <p>compoent</p>,
  },
  {
    type: NodeType.ConditionalOtherTools,
    icon: Conditional,
    label: "Conditional",
    component: <p>compoent</p>,
  },
];

function OtherToolItem({ type, icon, label }) {
  const handleDragStart = useNodeDrag(type);
  const IconComponent = icon;
  return (
    <div key={type} draggable onDragStart={handleDragStart}>
      <div className={cn(buttonVariants({ variant: "outline" }), "w-16 h-16")}>
        <IconComponent />
      </div>
      <p className="text-xs font-semibold text-center">{label}</p>
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
            />
          );
        })}
      </div>
    </div>
  );
}
