import { NodeType, TriggerNode } from "@/types";
import Manual from "@/components/nodes/triggers/Manual";
import Schedule from "@/components/nodes/triggers/Schedule";
import Webhook from "@/components/nodes/triggers/Webhook";
import Form from "@/components/nodes/triggers/Form";
import NewFlow from "@/components/nodes/NewFlow";
import { NodeTypes } from "@xyflow/react";

export const TriggerNodeDescription: TriggerNode[] = [
  {
    type: NodeType.ManualTrigger,
    name: "Manual Trigger",
    description: "Manually start the workflow execution",
  },
  {
    type: NodeType.ScheduleTrigger,
    name: "Schedule Trigger",
    description:
      "Run workflow on a schedule (cron, interval, or specific times)",
  },
  {
    type: NodeType.WebhookTrigger,
    name: "Webhook Trigger",
    description: "Start workflow when HTTP request is received at webhook URL",
  },
  {
    type: NodeType.FormTrigger,
    name: "Form Trigger",
    description: "Trigger workflow when form is submitted via web interface",
  },
] as const;

export const nodeTypes = {
  // "position-logger": PositionLoggerNode,
  [NodeType.NewFlow]: NewFlow,
  [NodeType.ManualTrigger]: Manual,
  [NodeType.ScheduleTrigger]: Schedule,
  [NodeType.WebhookTrigger]: Webhook,
  [NodeType.FormTrigger]: Form,
} satisfies NodeTypes;
