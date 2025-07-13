import EdgeComponent from "@/components/nodes/Edge";
import type { Edge, EdgeTypes } from "@xyflow/react";

export const initialEdges = [
  { id: "a->c", source: "a", target: "c", animated: true },
  { id: "b->d", source: "b", target: "d" },
  { id: "c->d", source: "c", target: "d", animated: true, type: "edge" },
  { id: "new->c", source: "new", target: "c" },
] satisfies Edge[];

export const edgeTypes = {
  edge: EdgeComponent,
  // Add your custom edge types here!
} satisfies EdgeTypes;

export const scheduleTypes = [
  {
    value: "interval",
    label: "Interval",
    description: "Run every X minutes/hours/days",
    disable: true,
  },
  {
    value: "cron",
    label: "Cron Expression",
    description: "Advanced scheduling with cron syntax",
    disable: true,
  },
  {
    value: "daily",
    label: "Daily",
    description: "Run once per day at specific time",
    disable: true,
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Run once per week",
    disable: true,
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "Run once per month",
    disable: true,
  },
  {
    value: "once",
    label: "One Time",
    description: "Run once at specific date/time",
    disable: false,
  },
];

export const intervalUnits = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

export const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)", disable: true },
  { value: "America/New_York", label: "Eastern Time (ET)", disable: true },
  { value: "America/Chicago", label: "Central Time (CT)", disable: true },
  { value: "America/Denver", label: "Mountain Time (MT)", disable: true },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", disable: true },
  { value: "Europe/London", label: "London (GMT/BST)", disable: true },
  { value: "Europe/Paris", label: "Paris (CET/CEST)", disable: true },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", disable: true },
  { value: "Asia/Kolkata", label: "India (IST)", disable: false },
];
