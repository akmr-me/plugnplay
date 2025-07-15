"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fieldTypes } from "@/constants";
import useDebounceCallback from "@/hooks/useDebounceCallback";
import { updateFormField } from "@/service/node";
import { FieldType } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { Trash2, Type } from "lucide-react";

type FieldEditorProps = {
  field: FieldType;
  setFields: React.Dispatch<React.SetStateAction<FieldType[]>>;
  workflowId: string;
  deleteField: (id: string) => void;
};

const FieldEditor = ({
  field,
  setFields,
  workflowId,
  deleteField,
}: FieldEditorProps) => {
  const updateDebouncedFormField = useDebounceCallback(updateFormField, 400);
  const { getToken } = useAuth();
  const FieldIcon = fieldTypes.find((t) => t.type === field.type)?.icon || Type;
  const updateField = async (id: string, updates: FieldType) => {
    const token = await getToken();
    if (!token) return;
    const res = updateDebouncedFormField(token, workflowId, field.id, updates);
    console.log("updated", res);
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  return (
    <Card key={field.id} className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FieldIcon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs capitalize">
              {field.type} Field
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteField(field.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label
                htmlFor={`label-${field.id}`}
                className="text-sm font-medium"
              >
                Field Label
              </Label>
              <Input
                id={`label-${field.id}`}
                value={field.label || ""}
                onChange={(e) =>
                  updateField(field.id, {
                    label: e.target.value,
                  } as FieldType)
                }
                placeholder="Enter field label"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`placeholder-${field.id}`}
                className="text-sm font-medium"
              >
                Placeholder
              </Label>
              <Input
                id={`placeholder-${field.id}`}
                value={field.placeholder || ""}
                onChange={(e) =>
                  updateField(field.id, {
                    placeholder: e.target.value,
                  } as FieldType)
                }
                placeholder="Enter placeholder text"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`required-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) =>
                updateField(field.id, {
                  required: checked as boolean,
                } as FieldType)
              }
            />
            <Label
              htmlFor={`required-${field.id}`}
              className="text-sm font-medium cursor-pointer"
            >
              Required field
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldEditor;
