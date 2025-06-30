"use client";
import { NodeType } from "@/types";
import { GeminiFill } from "@/components/Icons/Gemini";
import { OpenaiFill } from "@/components/Icons/OpenAI";
import { Tools } from "@/components/Icons/Tools";
import { OutlineMemory } from "@/components/Icons/Memory";
import { HttpGet } from "@/components/Icons/Http";
import { Mail, WebhookIcon } from "lucide-react";
import { Javascript } from "@/components/Icons/Javascript";
import { NotionFill } from "@/components/Icons/Notion";
import { Sleep } from "@/components/Icons/Sleep";
import { Conditional } from "@/components/Icons/Conditional";

export const AIToolsIcons: Record<string, unknown> = {
  [NodeType.OpenAITools]: OpenaiFill,
  [NodeType.GeminiAITools]: GeminiFill,
  [NodeType.MemoryAITools]: OutlineMemory,
  [NodeType.ToolsAITools]: Tools,
};

export const ProgrammingToolsIcon: Record<string, unknown> = {
  [NodeType.HttpProgrammingTools]: HttpGet,
  [NodeType.WebhookProgrammingTools]: WebhookIcon,
  [NodeType.JavaScriptProgrammingTools]: Javascript,
};

export const OtherToolsIcon: Record<string, unknown> = {
  [NodeType.MailOtherTools]: Mail,
  [NodeType.NotionOtherTools]: NotionFill,
  [NodeType.SleepOtherTools]: Sleep,
  [NodeType.ConditionalOtherTools]: Conditional,
};
