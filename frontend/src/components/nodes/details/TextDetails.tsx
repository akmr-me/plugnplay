import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Copy, Trash2, Settings } from "lucide-react";
import DetailsModal from "./Modal";
import WorkflowJSON from "./WorkflowJSON";
import { toast } from "sonner";
import { useReactFlow } from "@xyflow/react";

interface LabelInputManagerProps {
  setSelectedNode: (node: unknown) => void;
  node: unknown;
}

const LabelInputManager: React.FC<LabelInputManagerProps> = ({
  setSelectedNode,
  node,
}) => {
  const [fields, setFields] = useState(
    node.data?.state?.fields || [{ id: 1, label: "", value: "" }]
  );
  const { updateNodeData } = useReactFlow();

  // 'error' or 'success'

  const showToastMessage = (
    message: string,
    type: "success" | "error" = "error"
  ) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const copyToClipboard = async (text: string, fieldType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToastMessage(`${fieldType} copied to clipboard!`, "success");
    } catch {
      showToastMessage("Failed to copy to clipboard", "error");
    }
  };

  const handleLabelChange = (id: number, label: string) => {
    setFields(
      fields.map((field) => (field.id === id ? { ...field, label } : field))
    );
  };

  const handleValueChange = (id: number, value: string) => {
    setFields(
      fields.map((field) => (field.id === id ? { ...field, value } : field))
    );
  };

  const canAddNewField = () => {
    if (fields.length >= 5) return false;

    // Check if the last field has a label
    const lastField = fields[fields.length - 1];
    return lastField.label.trim() !== "";
  };

  const addNewField = () => {
    if (!canAddNewField()) {
      if (fields.length >= 5) {
        showToastMessage("Maximum 5 fields allowed", "error");
      } else {
        showToastMessage(
          "Please fill the label in the previous field before adding a new one",
          "error"
        );
      }
      return;
    }

    const newField = {
      id: Date.now(),
      label: "",
      value: "",
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: number) => {
    if (fields.length === 1) {
      showToastMessage("At least one field is required", "error");
      return;
    }
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleSaveConfiguration = () => {
    const validFields = fields.filter((field) => field.label.trim() !== "");
    if (validFields.length === 0) {
      showToastMessage("Please add at least one field with a label", "error");
      return;
    }

    console.log("Saving configuration:", validFields);
    updateNodeData(node.id, {
      ...node.data,
      state: {
        fields: validFields,
      },
    });

    showToastMessage("Configuration saved successfully!", "success");
  };

  return (
    <DetailsModal setSelectedNode={setSelectedNode}>
      <WorkflowJSON node={node} type="input" />

      <ScrollArea className="max-h-[70vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4">
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Text
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {fields.filter((f) => f.label.trim() !== "").length} / 5
                  Fields
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {fields.map((field, index: number) => (
                <div
                  key={field.id}
                  className="space-y-3 p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Field {index + 1}
                    </Label>
                    {fields.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Label Input */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`label-${field.id}`}
                      className="text-sm font-medium"
                    >
                      Label
                    </Label>
                    <div className="relative">
                      <Input
                        id={`label-${field.id}`}
                        value={field.label}
                        onChange={(e) =>
                          handleLabelChange(field.id, e.target.value)
                        }
                        placeholder="Enter label name"
                        className="pr-10"
                      />
                      {field.label && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(field.label, "Label")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Value Input */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`value-${field.id}`}
                      className="text-sm font-medium"
                    >
                      Value
                    </Label>
                    <div className="relative">
                      <Input
                        id={`value-${field.id}`}
                        value={field.value}
                        onChange={(e) =>
                          handleValueChange(field.id, e.target.value)
                        }
                        placeholder="Enter value"
                        className="pr-10"
                      />
                      {field.value && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(field.value, "Value")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Field Button */}
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNewField}
                  disabled={!canAddNewField()}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Field
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={handleSaveConfiguration}
                >
                  Save Configuration
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNode?.(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </DetailsModal>
  );
};

export default LabelInputManager;
