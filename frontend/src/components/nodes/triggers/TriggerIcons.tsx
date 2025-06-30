"use client";
import { LucideReactIcon, NodeType } from "@/types";
import {
  SquareMousePointer,
  Clock4 as Clock,
  Webhook as WebhookIcon,
  NotebookPen,
  Plus,
} from "lucide-react";

const TriggerIcons: Record<string, LucideReactIcon> = {
  [NodeType.ManualTrigger]: SquareMousePointer,
  [NodeType.ScheduleTrigger]: Clock,
  [NodeType.WebhookTrigger]: WebhookIcon,
  [NodeType.FormTrigger]: NotebookPen,
  [NodeType.NewFlow]: Plus,
};

export default TriggerIcons;
