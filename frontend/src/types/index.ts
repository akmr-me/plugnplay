import { BuiltInNode, Edge, Node, Viewport } from "@xyflow/react";
import { LucideProps } from "lucide-react";
import React, { ForwardRefExoticComponent } from "react";

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
  TextOtherTools = "text-other-tool",
  ConditionalOtherTools = "conditional-other-tool",
}

export type NodeData = {
  // id: string;
  type?: NodeType;
  inputs?: Record<string, unknown>[];
  output?: Record<string, unknown>;
  run(): Promise<unknown>;
  state: Record<string, unknown>;
  error?: string;
  description?: string;
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
// type CustomAppNode = {
//   id: string;
//   workflowId: string;
//   data: NodeData;
// };
export type AppNode = BuiltInNode | Node<NodeData, NodeType>;

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

export type DetailsModalProps = {
  node: Node;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node>>;
};

// **********************************************************FORM******************************************
export type ValidField = "text" | "email" | "number" | "textarea" | "date";
export type FormFieldType = {
  type: ValidField;
  label: string;
  icon: LucideReactIcon;
};
export type FieldType = {
  id: string;
  type: ValidField;
  label?: string;
  required: boolean;
  placeholder?: string;
  position: number;
};
