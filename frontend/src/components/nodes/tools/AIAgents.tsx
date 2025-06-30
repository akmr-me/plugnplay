import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { GeminiFill } from "@/components/Icons/Gemini";
import { OpenaiFill } from "@/components/Icons/OpenAI";
import { Separator } from "@/components/ui/separator";
import { OutlineMemory } from "@/components/Icons/Memory";
import { Tools } from "@/components/Icons/Tools";
import useNodeDrag from "@/hooks/useNodeDrag";
import { NodeType } from "@/types";

const AiAgents = [
  {
    type: NodeType.OpenAITools,
    icon: OpenaiFill,
    label: "Open AI",
    component: <p>compoent</p>,
  },
  {
    type: NodeType.GeminiAITools,
    icon: GeminiFill,
    label: "Gemini",
    component: <p>compoent</p>,
  },
  {
    type: NodeType.MemoryAITools,
    icon: OutlineMemory,
    label: "Memory",
    component: <p>compoent</p>,
  },
  {
    type: NodeType.ToolsAITools,
    icon: Tools,
    label: "Tools",
    component: <p>compoent</p>,
  },
];

const AgetnItem = ({ type, icon, label }: AgetnItemProps) => {
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
};

export default function AIAgents(params: type) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-bold">AI Agents</h2>
      <Separator orientation="horizontal" className="h-2" />
      <div className="flex gap-2">
        {AiAgents.map((item) => {
          return (
            <AgetnItem
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

type AgetnItemProps = {
  type: NodeType;
  icon: React.ElementType;
  label: string;
  component?: React.ReactNode;
};
