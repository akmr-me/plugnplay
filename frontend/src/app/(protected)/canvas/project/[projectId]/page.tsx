"use client";
import CreateProject from "@/components/canvas/sidebar/CreateProject";
import { useFlowSelectors } from "@/stores";
import { useParams } from "next/navigation";

export default function Page() {
  const { currentProject } = useFlowSelectors();
  const params = useParams();
  // console.log(params);
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-muted-foreground pr-1">
        No workflow selected. Please select a workflow to continue or
      </p>
      {currentProject?.name && (
        <CreateProject
          isCreateProject={false}
          projectId={currentProject.id}
          projectName={currentProject.name}
          key={currentProject.id}
        />
      )}
    </div>
  );
}
