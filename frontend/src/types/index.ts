import { BuiltInNode, Edge, Node, Viewport } from "@xyflow/react";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent } from "react";

export enum NodeType {
  NewFlow = "new-flow",
  ManualTrigger = "manual-trigger",
  ScheduleTrigger = "schedule-trigger",
  WebhookTrigger = "webhook-trigger",
  FormTrigger = "form-trigger",
  OpenAITools = "open-ai-tool",
  GeminiAITools = "gemini-ai-tool",
  MemoryAITools = "memory-ai-tool",
  ToolsAITools = "tools-ai-tool",
  HttpProgrammingTools = "http-programming-tool",
  JavaScriptProgrammingTools = "javascript-programming-tool",
  WebhookProgrammingTools = "webhook-programming-tool",
  MailOtherTools = "mail-other-tool",
  NotionOtherTools = "notion-other-tool",
  SleepOtherTools = "sleep-other-tool",
  ConditionalOtherTools = "conditional-other-tool",
}

export type NodeData = {
  id: string;
  type: NodeType;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  run(): Promise<unknown>;
};

export type Flow = {
  id: string;
  name: string;
  description: string;
  nodes: AppNode[];
  edges: Edge[];
  viewport: Viewport;
  projectId?: string;
  connections?: Record<string, string[]>;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  flows: Flow[];
};

export type AppNode = BuiltInNode | Node<{ label?: string }, NodeType>;

export type TriggerNode = {
  type: NodeType;
  name: string;
  description: string;
};

export enum HistoryAction {
  AddNode = "addNode",
  RemoveNode = "removeNode",
  AddEdge = "addEdge",
  RemoveEdge = "removeEdge",
}

export type LucideReactIcon = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;
