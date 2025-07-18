"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WebhookIcon } from "lucide-react";
import { Javascript } from "@/components/Icons/Javascript";
import { HttpGet } from "@/components/Icons/Http";
import { NodeType } from "@/types";
import useNodeDrag from "@/hooks/useNodeDrag";
import ComingSoonRibon from "@/components/ComingSoonRibon";

const Programming = [
  {
    type: NodeType.HttpProgrammingTools,
    icon: HttpGet,
    label: "http",
    component: <p>compoent</p>,
  },
  {
    type: NodeType.JavaScriptProgrammingTools,
    icon: Javascript,
    label: "JS",
    component: <p>compoent</p>,
  },
  {
    type: NodeType.WebhookProgrammingTools,
    icon: WebhookIcon,
    label: "Webhook",
    component: <p>compoent</p>,
  },
];

const ProgrammingItem = ({ type, icon, label }: ProgrammingItemProps) => {
  const handleDragStart = useNodeDrag(type);
  const IconComponent = icon;
  const isDisabled = type !== "http-programming-tool"; // Replace with actual logic if needed
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
};

export default function ProgrammingTools() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold">Programming</h2>
      <Separator orientation="horizontal" className="h-2" />
      <div className="flex gap-2">
        {Programming.map((item) => {
          return (
            <ProgrammingItem
              key={item.type}
              type={item.type}
              icon={item.icon}
              label={item.label}
              component={item.component}
            />
          );
        })}
      </div>
    </div>
  );
}

type ProgrammingItemProps = {
  type: NodeType;
  icon: React.ElementType;
  label: string;
  component: React.ReactNode;
};
