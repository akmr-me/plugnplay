"use client";
import Canvas from "@/components/canvas";
import { ReactFlowProvider } from "@xyflow/react";

export default function Page() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}
// test
