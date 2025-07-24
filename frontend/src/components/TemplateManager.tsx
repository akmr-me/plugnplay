import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { publishWorkflow } from "@/service/node";
import { useParams } from "next/navigation";

type TemplateModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isPublishing: boolean;
  setIsPublishing: (publishing: boolean) => void;
};

type Errors = {
  name?: string;
  description?: string;
};

const TemplateModal = ({
  isOpen,
  setIsOpen,
  isPublishing,
  setIsPublishing,
}: TemplateModalProps) => {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const { user } = useUser();
  const { getToken } = useAuth();
  const params = useParams();

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!templateName.trim()) {
      newErrors.name = "Template name is required";
    } else if (templateName.trim().length < 3) {
      newErrors.name = "Template name must be at least 3 characters";
    }

    if (!templateDescription.trim()) {
      newErrors.description = "Template description is required";
    } else if (templateDescription.trim().length < 10) {
      newErrors.description =
        "Template description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    const token = await getToken();
    if (!token) return;
    try {
      setIsPublishing(true);
      const response = await publishWorkflow(
        token,
        user.id,
        params.flowId,
        params.projectId,
        { name: templateName, description: templateDescription }
      );
      console.log("Publish response:", response);
      toast.success("Workflow published successfully!");
      setTemplateName("");
      setTemplateDescription("");
      setErrors({});
      setIsPublishing(false);
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to publish workflow", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
      console.error("Error publishing workflow:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancel = () => {
    setTemplateName("");
    setTemplateDescription("");
    setErrors({});
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Template</DialogTitle>
          <DialogDescription>
            Fill in the details below to create your new template.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="templateName">Template Name *</Label>
            <Input
              id="templateName"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter template name..."
              className={errors.name ? "border-red-500" : ""}
              maxLength={100}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="templateDescription">Template Description *</Label>
            <Textarea
              id="templateDescription"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe what this template is for..."
              rows={4}
              className={errors.description ? "border-red-500" : ""}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-xs text-slate-500">
              {templateDescription.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={
              isPublishing ||
              !templateName.trim() ||
              !templateDescription.trim()
            }
          >
            {isPublishing ? (
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
                Publishing...
              </div>
            ) : (
              "Publish Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateModal;
