"use client";
import Canvas from "@/components/canvas";
import CreateProject from "@/components/canvas/sidebar/CreateProject";

export default function Page() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground pr-2">
        No Project selected. Please select a project to continue or
      </p>
      <CreateProject />
    </div>
  );
  return <Canvas />;
}
