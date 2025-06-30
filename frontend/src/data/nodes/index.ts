import type { Node, NodeTypes, BuiltInNode } from "@xyflow/react";
import { PositionLoggerNode } from "./PositionLoggerNode";
import { NodeType } from "@/types";
import Manual from "@/components/nodes/triggers/Manual";
import Schedule from "@/components/nodes/triggers/Schedule";
import Webhook from "@/components/nodes/triggers/Webhook";
import Form from "@/components/nodes/triggers/Form";
import NewFlow from "@/components/nodes/NewFlow";
import OpenAI from "@/components/nodes/tools/ai/OpenAi";
import GeminiAI from "@/components/nodes/tools/ai/GeminiAI";
import AIToolNode from "@/components/nodes/tools/ai/AITool";
import MemoryAINode from "@/components/nodes/tools/ai/Memory";
import HttpNode from "@/components/nodes/tools/programming/HttpNode";
import WebhookNode from "@/components/nodes/tools/programming/WebhookNode";
import JavascriptNode from "@/components/nodes/tools/programming/JavascriptNode";
import MailNode from "@/components/nodes/tools/other/MailNode";
import SleepNode from "@/components/nodes/tools/other/SleepNode";
import NotionNode from "@/components/nodes/tools/other/NotionNode";
import ConditionalNode from "@/components/nodes/tools/other/ConditionNode";

export type PositionLoggerNode = Node<
  {
    label?: string;
  },
  "position-logger"
>;

export type AppNode =
  | BuiltInNode
  | PositionLoggerNode
  | Node<{ label?: string }, NodeType>;

export const startNode: AppNode = {
  id: "start",
  type: NodeType.NewFlow,
  position: { x: 0, y: 0 },
  data: { label: "wire" },
};

export const initialNodes: AppNode[] = [startNode];
//  [
//   {
//     id: "a",
//     type: NodeType.ManualTrigger,
//     position: { x: 0, y: 0 },
//     data: { label: "wire" },
//   },
//   {
//     id: "new",
//     type: NodeType.ScheduleTrigger,
//     position: { x: 250, y: 340 },
//     data: { label: "test label" },
//   },
//   {
//     id: "b",
//     type: NodeType.WebhookTrigger,
//     position: { x: -100, y: 100 },
//     data: { label: "drag me!" },
//   },
//   {
//     id: "c",
//     position: { x: 100, y: 100 },
//     data: { label: "your ideas" },
//     type: NodeType.FormTrigger,
//   },
//   // {
//   //   id: "d",
//   //   type: "output",
//   //   position: { x: 0, y: 200 },
//   //   data: { label: "with React Flow" },
//   // },
// ];

export const nodeTypes = {
  // "position-logger": PositionLoggerNode,
  [NodeType.NewFlow]: NewFlow,
  [NodeType.ManualTrigger]: Manual,
  [NodeType.ScheduleTrigger]: Schedule,
  [NodeType.WebhookTrigger]: Webhook,
  [NodeType.FormTrigger]: Form,
  [NodeType.OpenAITools]: OpenAI,
  [NodeType.GeminiAITools]: GeminiAI,
  [NodeType.ToolsAITools]: AIToolNode,
  [NodeType.MemoryAITools]: MemoryAINode,
  [NodeType.HttpProgrammingTools]: HttpNode,
  [NodeType.WebhookProgrammingTools]: WebhookNode,
  [NodeType.JavaScriptProgrammingTools]: JavascriptNode,
  [NodeType.MailOtherTools]: MailNode,
  [NodeType.SleepOtherTools]: SleepNode,
  [NodeType.NotionOtherTools]: NotionNode,
  [NodeType.ConditionalOtherTools]: ConditionalNode,
} satisfies NodeTypes;

export type TriggerNode = {
  type: NodeType;
  name: string;
  description: string;
};

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

const AITools: TriggerNode[] = [
  {
    type: NodeType.OpenAITools,
    name: "Open AI",
    description: "Take a text and generate a response using Open AI",
  },
  {
    type: NodeType.GeminiAITools,
    name: "Gemini AI",
    description: "Take a text and generate a response using Gemini AI",
  },
  {
    type: NodeType.MemoryAITools,
    name: "Memory",
    description: "Helps in keep context of the conversation with the user",
  },
  {
    type: NodeType.ToolsAITools,
    name: "Tools",
    description: "Use tools to get data from the internet",
  },
];

const ProgrammingTools: TriggerNode[] = [
  {
    type: NodeType.HttpProgrammingTools,
    name: "http",
    description:
      "Make GET or POST request to the ai in appplication/json format",
  },
  {
    type: NodeType.JavaScriptProgrammingTools,
    name: "javascript",
    description: "Run javascript code in the return value",
  },
  {
    type: NodeType.WebhookProgrammingTools,
    name: "webhook",
    description: "Make a webhook call to the ai",
  },
];

const OtherTools: TriggerNode[] = [
  {
    type: NodeType.MailOtherTools,
    name: "mail",
    description: "Send an email to the user",
  },
  {
    type: NodeType.NotionOtherTools,
    name: "notion",
    description: "Create a new page in Notion",
  },
  {
    type: NodeType.SleepOtherTools,
    name: "sleep",
    description: "Sleep for a given time",
  },
];

export const ToolsNodeDescription = {
  ai: AITools,
  programming: ProgrammingTools,
  other: OtherTools,
};
