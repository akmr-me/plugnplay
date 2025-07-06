import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Eye,
  Edit3,
  Calendar,
  Mail,
  Hash,
  Type,
  FileText,
  XIcon,
  FormInput,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Node, useReactFlow } from "@xyflow/react";
import { AppNode, LucideReactIcon } from "@/types";
import WorkflowJSON from "./WorkflowJSON";
import DetailsModal from "./Modal";

type FormFieldType = {
  type: ValidField;
  label: string;
  icon: LucideReactIcon;
};
type ValidField = "text" | "email" | "number" | "textarea" | "date";
type FieldType = {
  id: string;
  type: ValidField;
  label?: string;
  required: boolean;
  placeholder?: string;
};

const FormBuilder = ({
  node,
  setSelectedNode,
}: {
  node: Node;
  setSelectedNode: React.SetStateAction<AppNode | undefined>;
}) => {
  const { id, data } = node;
  const { updateNodeData } = useReactFlow();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formTitle, setFormTitle] = useState<string>(
    (data.formTitle as string) || "Untitled Form"
  );
  const [formDescription, setFormDescription] = useState<string>(
    (data.formDescription as string) || ""
  );
  const [fields, setFields] = useState<FieldType[]>(
    (data.fields as FieldType[]) || []
  );
  const [formResponses, setFormResponses] = useState<Record<string, string>>(
    {}
  );

  const fieldTypes: FormFieldType[] = [
    { type: "text", label: "Text", icon: Type },
    { type: "email", label: "Email", icon: Mail },
    { type: "number", label: "Number", icon: Hash },
    { type: "textarea", label: "Text Area", icon: FileText },
    { type: "date", label: "Date", icon: Calendar },
  ];

  const addField = (type: ValidField) => {
    const newField: FieldType = {
      id: Date.now().toString(),
      type,
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: FieldType) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const deleteField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
    const newResponses = { ...formResponses };
    delete newResponses[id];
    setFormResponses(newResponses);
  };

  const handleFormResponse = (
    fieldId: string,
    value: string,
    label: string
  ) => {
    setFormResponses((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = fields.filter((field) => field.required);
    const missingFields = requiredFields.filter(
      (field) =>
        !formResponses[field.id] ||
        formResponses[field.id].toString().trim() === ""
    );
    return missingFields;
  };

  const handleSubmit = () => {
    const missingFields = validateForm();
    if (missingFields.length > 0) {
      alert(
        `Please fill in the following required fields: ${missingFields
          .map((f) => f.label)
          .join(", ")}`
      );
      return;
    }

    console.log("Form Submitted:", {
      title: formTitle,
      description: formDescription,
      responses: formResponses,
    });
    try {
      updateNodeData(node.id, { ...node.data, output: formResponses });
    } catch (error) {
      console.error(error);
    }
    alert("Form submitted successfully!" + node.id);
  };
  console.log("node is updated", node);
  const renderFieldInput = (field: FieldType) => {
    const commonProps = {
      value: formResponses[field.label as string] || "",
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleFormResponse(String(field.id), e.target.value, field.label!),
      placeholder: field.placeholder,
    };

    switch (field.type) {
      case "text":
        return <Input type="text" {...commonProps} />;
      case "email":
        return <Input type="email" {...commonProps} />;
      case "number":
        return <Input type="number" {...commonProps} />;
      case "date":
        return <Input type="date" {...commonProps} />;
      case "textarea":
        return <Textarea {...commonProps} rows={4} />;
      default:
        return <Input type="text" {...commonProps} />;
    }
  };

  const renderFieldEditor = (field: FieldType) => {
    const FieldIcon =
      fieldTypes.find((t) => t.type === field.type)?.icon || Type;

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

  const renderPreviewField = (field: FieldType) => {
    return (
      <div key={field.id} className="space-y-2">
        <Label className="text-sm font-medium">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {renderFieldInput(field)}
      </div>
    );
  };

  const closeDialog = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof setSelectedNode === "function") {
      setSelectedNode(undefined);
    }
  };

  useEffect(() => {
    updateNodeData(id, {
      ...node.data,
      state: { fields, formDescription, formTitle },
    });
  }, [fields, formDescription, formTitle, id, updateNodeData]);
  console.log("node from flow builder", fields);
  return (
    <DetailsModal setSelectedNode={setSelectedNode}>
      <WorkflowJSON type="input" node={node} />
      <ScrollArea
        className="w-full max-w-xl mx-auto"
        onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
      >
        <div className="p-6 h-[90vh]">
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FormInput className="h-5 w-5" />
                  Form Builder
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      if (
                        !isPreviewMode &&
                        fields.some((field) => !field.label)
                      ) {
                        alert("Please give label to all fields!");
                        return;
                      }
                      setIsPreviewMode(!isPreviewMode);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    {isPreviewMode ? (
                      <Edit3 className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    <span>{isPreviewMode ? "Edit" : "Preview"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeDialog}
                    className="text-destructive hover:text-destructive"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Form Title and Description */}
              <div className="space-y-4">
                {!isPreviewMode ? (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="form-title"
                        className="text-sm font-medium"
                      >
                        Form Title
                      </Label>
                      <Input
                        id="form-title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Enter form title"
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="form-description"
                        className="text-sm font-medium"
                      >
                        Form Description (Optional)
                      </Label>
                      <Textarea
                        id="form-description"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Enter form description"
                        rows={2}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">{formTitle}</h2>
                    {formDescription && (
                      <p className="text-muted-foreground">{formDescription}</p>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Form Builder/Preview Content */}
              {!isPreviewMode ? (
                <div className="space-y-6">
                  {/* Field Type Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Add Field</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {fieldTypes.map(({ type, label, icon: Icon }) => (
                        <Button
                          key={type}
                          onClick={() => addField(type)}
                          variant="outline"
                          className="flex flex-col items-center gap-2 h-auto p-3 hover:bg-primary/5"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Field Editors */}
                  <div className="space-y-4">
                    {fields.length === 0 ? (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground text-center">
                            No fields added yet. Choose a field type above to
                            get started.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      fields.map(renderFieldEditor)
                    )}
                  </div>
                </div>
              ) : (
                /* Preview Mode */
                <div className="space-y-6">
                  {fields.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No fields to display. Switch to edit mode to add fields.
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {fields.map(renderPreviewField)}
                      </div>
                      <Separator />
                      <div className="flex justify-end">
                        <Button onClick={handleSubmit} className="px-8">
                          Submit Form
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
      <WorkflowJSON node={node} type="output" />
    </DetailsModal>
  );
};

export default FormBuilder;
