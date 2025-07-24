import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { fetchAllProjects } from "@/service/flow";
import { forkTemplate } from "@/service/node";

type ForkTemplateModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isForking: boolean;
  setIsForking: (forking: boolean) => void;
};

type Project = {
  id: string;
  name: string;
};

type Errors = {
  projectId?: string;
  workflowName?: string;
};

const ForkTemplateModal = ({
  isOpen,
  setIsOpen,
  isForking,
  setIsForking,
}: ForkTemplateModalProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [workflowName, setWorkflowName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const { user } = useUser();
  const { getToken } = useAuth();
  const params = useParams();

  // Fetch projects when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    try {
      setIsLoadingProjects(true);
      const token = await getToken();
      if (!token) return;

      // Replace with your actual API endpoint
      const response = await fetchAllProjects(token, user?.id || "");

      setProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects", {
        description: "Please try again later",
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!selectedProjectId) {
      newErrors.projectId = "Please select a project";
    }

    if (!workflowName.trim()) {
      newErrors.workflowName = "Workflow name is required";
    } else if (workflowName.trim().length < 3) {
      newErrors.workflowName = "Workflow name must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFork = async () => {
    if (!validateForm()) return;

    const token = await getToken();
    if (!token) return;

    try {
      setIsForking(true);

      const result = await forkTemplate(
        token,
        user?.id || "",
        params.templateId || "",
        workflowName,
        selectedProjectId
      );

      console.log("Fork response:", result);

      toast.success("Template forked successfully!");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to fork template");
      console.error("Error forking template:", error);
    } finally {
      setIsForking(false);
    }
  };

  const resetForm = () => {
    setSelectedProjectId("");
    setWorkflowName("");
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fork Template</DialogTitle>
          <DialogDescription>
            Select a project and provide a name to fork this template into your
            workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2 w-full">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={isLoadingProjects}
            >
              <SelectTrigger
                className={
                  errors.projectId ? "border-red-500 w-full" : "w-full"
                }
              >
                <SelectValue
                  placeholder={
                    isLoadingProjects
                      ? "Loading projects..."
                      : "Select a project"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-sm text-red-600">{errors.projectId}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="workflowName">Workflow Name *</Label>
            <Input
              id="workflowName"
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name..."
              className={errors.workflowName ? "border-red-500" : ""}
              maxLength={100}
            />
            {errors.workflowName && (
              <p className="text-sm text-red-600">{errors.workflowName}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isForking}>
            Cancel
          </Button>
          <Button
            onClick={handleFork}
            disabled={
              isForking ||
              !selectedProjectId ||
              !workflowName.trim() ||
              isLoadingProjects
            }
          >
            {isForking ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Forking...
              </div>
            ) : (
              "Fork Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForkTemplateModal;
