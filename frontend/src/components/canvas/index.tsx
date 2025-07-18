"use client";

import Flow from "./Flow";
import { useFlowSelectors } from "@/stores";
import CreateProject from "./sidebar/CreateProject";

export default function Canvas() {
  const { currentFlow, currentProject } = useFlowSelectors();

  return currentFlow?.name ? (
    <Flow />
  ) : (
    <>
      <div className="flex h-full items-center justify-center">
        <>
          <p className="text-muted-foreground pr-1">
            No workflow selected. Please select a workflow to continue or
          </p>
          {currentProject?.id && (
            <CreateProject
              isCreateProject={false}
              projectId={currentProject.id}
              projectName={currentProject.name}
              key={currentProject.id}
            />
          )}
        </>
      </div>
    </>
  );
}
