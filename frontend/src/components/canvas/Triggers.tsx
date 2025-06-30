"use client";
import { TriggerNode } from "@/data/nodes";
import { SidebarInput } from "../ui/sidebar";
import TriggerNToolsDescription from "./TriggerNToolsDescription";
import { useState } from "react";
import { Search } from "lucide-react";
import { Label } from "../ui/label";

type TriggersProps = {
  tools: TriggerNode[];
};

export default function Triggers({ tools }: TriggersProps) {
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
      <h2 className="text-2xl font-bold">Triggers</h2>
      <p className="text-gray-600">
        This section allows you to manage trigger your workflow.
      </p>
      <div />
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="workflow-trigger-search"
          placeholder="Search triggers..."
          className="pl-8"
          onChange={handleSearchChange}
        />{" "}
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
      </div>
      <div />
      {/* Add your components for triggers and tools here */}
      <div className="flex flex-wrap gap-4">
        {filteredTools.map((tool) => (
          <div
            key={tool.type}
            className="p-2 border rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <TriggerNToolsDescription {...tool} />
          </div>
        ))}
      </div>
      <p className="text-gray-600">
        Drag and drop the components to the canvas to use them in your workflow.
      </p>
    </div>
  );
}
