"use client";
import { TriggerNode } from "@/data/nodes";
import { SidebarInput } from "../ui/sidebar";
import { useState } from "react";
import { Search } from "lucide-react";
import { Label } from "../ui/label";
import AIAgents from "../nodes/tools/AIAgents";
import ProgrammingTools from "../nodes/tools/Code";
import OtherTools from "../nodes/tools/Others";

type TriggersProps = {
  tools: TriggerNode[];
};

export default function Tools({ tools }: TriggersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  // Filter tools based on search term
  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="flex flex-col gap-2 text-black dark:text-white">
      <h2 className="text-2xl font-bold">Tools</h2>
      <p className="text-gray-600">
        This section allows you to manage tools for your workflow.
      </p>
      <div />
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="workflow-tools-search"
          placeholder="Search tools..."
          className="pl-8"
          onChange={handleSearchChange}
        />{" "}
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
      <div />
      {/* Add your components for triggers and tools here */}
      <div className="flex flex-wrap gap-4">
        <AIAgents />
        <ProgrammingTools />
        <OtherTools />
      </div>
      <p className="text-gray-600">
        Drag and drop the components to the canvas to use them in your workflow.
      </p>
    </div>
  );
}
