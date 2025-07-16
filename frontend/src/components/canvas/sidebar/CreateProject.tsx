"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createNewProject,
  createNewWorkflow,
  fetchAllProjects,
} from "@/service/flow";
import { useFlowActions, useFlowSelectors } from "@/stores";
import { Flow, Project } from "@/types";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CreateProjectProps = {
  projectName?: string;
  isCreateProject?: boolean;
  projectId?: string;
  getAllFlows?: () => void;
};

export default function CreateProject({
  projectName: projectNameProp,
  isCreateProject = true,
  projectId,
  getAllFlows,
}: CreateProjectProps) {
  const [projectName, setProjectName] = useState(projectNameProp || "");
  const [workflowName, setWorkflowName] = useState("");
  const [open, setOpen] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const { addProject, addFlow, setCurrentFlow, setCurrentProject } =
    useFlowActions();
  const { allProjects } = useFlowSelectors();

  const handleCreateNewProject = async () => {
    if (!projectName) return;
    if (
      projectName.length < 3 ||
      projectName.length > 20 ||
      (workflowName && workflowName.length < 3) ||
      (workflowName && workflowName.length > 20)
    ) {
      alert("Names must be between 3 and 20 characters.");
      return;
    }
    // Check if project already exists
    if (
      allProjects.some(
        (project) => project.name.toLowerCase() === projectName.toLowerCase()
      )
    ) {
      alert("Project with this name already exists.");
      return;
    }
    const token = await getToken();
    let route: string = "/canvas/";
    if (!token || !user?.id) return;
    const newProject: Project = await createNewProject(
      token,
      projectName,
      user?.id
    );
    route += "project/" + newProject.id;
    setCurrentProject(newProject);
    console.log("created project", newProject);
    if (workflowName) {
      const newWorkflow: Flow = await createNewWorkflow(
        token,
        workflowName,
        user.id,
        newProject.id
      );
      // newProject.flows.push(newWorkflow);
      console.log("create new workflow", newWorkflow);
      setCurrentFlow(newWorkflow);
      route += "/flow/" + newWorkflow.id;
    }
    setWorkflowName("");
    const projects = await fetchAllProjects(token, user?.id);
    console.log({ projects });
    addProject(projects?.data);
    // setCurrentFlow(newProject)
    setOpen(false);
    router.push(route);
  };

  const handleAddFlow = async () => {
    if (!projectName || !workflowName) return;
    if (workflowName.length < 3 || workflowName.length > 20) {
      alert("Workflow name must be between 3 and 20 characters.");
      return;
    }

    const token = await getToken();
    if (!token || !user?.id || !projectId) return;

    const newFlow = await createNewWorkflow(
      token,
      workflowName,
      user?.id,
      projectId
    );
    console.log("workflow", newFlow);
    addFlow(newFlow);
    // setCurrentFlow(newFlow)
    setWorkflowName("");
    setOpen(false);
    router.push("/canvas/project/" + projectId + "/flow/" + newFlow.id);
    // if (typeof getAllFlows == "function") getAllFlows();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
      }}
    >
      <DialogTrigger asChild>
        {isCreateProject ? (
          <Button
            className="text-lg cursor-pointer"
            onClick={() => setProjectName("")}
          >
            <span className="text-2xl text-center font-[400]">+</span>Create
          </Button>
        ) : (
          <Button
            size="sm"
            variant="link"
            className="text-xs text-green-500 p-0"
          >
            Add Flow
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project Name</DialogTitle>
          <DialogDescription>
            {allProjects.length >= 2 && !projectName ? (
              <p className="text-xs text-red-500">
                You can only have 2 projects at a time.
              </p>
            ) : (
              <p>Give your project a name and a create Workflow.</p>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link">Project Name</Label>
            <Input
              id="project-name"
              placeholder="Type here..."
              onChange={(e) => setProjectName(e.target.value)}
              required
              value={projectName}
              disabled={!!projectNameProp}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link">Workflow Name</Label>
            <Input
              id="workflow-name"
              placeholder="workflow name"
              onChange={(e) => setWorkflowName(e.target.value)}
              value={workflowName}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          {/* <DialogClose asChild> */}
          <Button
            type="button"
            variant="secondary"
            disabled={!projectName}
            onClick={!projectNameProp ? handleCreateNewProject : handleAddFlow}
          >
            {!projectNameProp ? "Create Project" : "Add Flow"}
          </Button>
          {/* </DialogClose> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
