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
  // CrossIcon,
  XIcon,
} from "lucide-react";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { DialogContent } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Node, useReactFlow } from "@xyflow/react";
import { AppNode, LucideReactIcon } from "@/types";

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
      // label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      // placeholder: `Enter ${type}...`,
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
  console.log({ formDescription, formResponses, fields });
  const handleFormResponse = (fieldId: string, value: string) => {
    setFormResponses((prev) => ({
      ...prev,
      [fieldId]: value,
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
    alert("Form submitted successfully!");
  };

  const renderFieldInput = (field: FieldType) => {
    const commonProps = {
      className:
        "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      placeholder: field.placeholder,
      value: formResponses[field.id] || "",
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleFormResponse(String(field.id), e.target.value),
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
        return (
          <textarea
            {...commonProps}
            rows={4}
            className={`${commonProps.className} resize-vertical`}
          />
        );
      default:
        return <Input type="text" {...commonProps} />;
    }
  };

  const renderFieldEditor = (field: FieldType) => {
    const FieldIcon =
      fieldTypes.find((t) => t.type === field.type)?.icon || Type;

    return (
      <div
        key={field.id}
        className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FieldIcon size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 capitalize">
              {field.type} Field
            </span>
          </div>
          <Button
            onClick={() => deleteField(field.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <Trash2 size={16} />
          </Button>
        </div>

        <div className="space-y-2 flex gap-2">
          <Input
            type="text"
            value={field.label}
            onChange={(e) =>
              updateField(field.id, { label: e.target.value } as FieldType)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-700"
            placeholder="Field label"
          />

          <Input
            type="text"
            value={field.placeholder}
            onChange={(e) =>
              updateField(field.id, {
                placeholder: e.target.value,
              } as FieldType)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-700"
            placeholder="Placeholder text"
          />

          <label className="flex items-center text-xs dark:text-gray-700">
            <Input
              type="checkbox"
              checked={field.required}
              onChange={(e) =>
                updateField(field.id, {
                  required: e.target.checked,
                } as FieldType)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Required field</span>
          </label>
        </div>
      </div>
    );
  };

  const renderPreviewField = (field: FieldType) => {
    return (
      <div key={field.id} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-600">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
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
    updateNodeData(id, { fields, formDescription, formTitle });
  }, [fields, formDescription, formTitle, id, updateNodeData]);

  return (
    <Dialog open>
      <DialogPortal container={document.getElementById("dialog-portal")}>
        <DialogContent
          className="w-[99vw] overflow-x-hidden h-screen flex items-center bg-black/50"
          onClick={closeDialog}
        >
          <ScrollArea
            className="w-2xl mx-auto p-6 bg-gray-50 h-5/6 rounded-lg bg-gradient-to-r from-orange-500 to-red-600"
            onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
          >
            {/* <div className="w-2xl mx-auto p-6 bg-gray-50 h-5/6"> */}
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 ">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  Form Builder
                </h1>
                <div className="flex">
                  <Button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    size="sm"
                  >
                    {isPreviewMode ? <Edit3 size={16} /> : <Eye size={16} />}
                    <span>{isPreviewMode ? "Edit" : "Preview"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 cursor-pointer text-2xl"
                    title="Close"
                    onClick={closeDialog}
                  >
                    <XIcon />
                  </Button>
                </div>
              </div>

              {!isPreviewMode ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full text-xl font-semibold border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1 text-gray-600"
                    placeholder="Form Title"
                  />
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full text-gray-600 border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1 resize-none"
                    placeholder="Form Description (optional)"
                    rows={2}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {formTitle}
                  </h2>
                  {formDescription && (
                    <p className="text-gray-600">{formDescription}</p>
                  )}
                </div>
              )}
            </div>

            {/* Form Builder/Preview Content */}
            {!isPreviewMode ? (
              <div className="space-y-6">
                {/* Field Type Selector */}
                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Add Field
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {fieldTypes.map(({ type, label, icon: Icon }) => (
                      <Button
                        key={type}
                        onClick={() => addField(type)}
                        className="flex items-center space-y-2 p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors hover:text-gray-700"
                      >
                        <Icon size={20} className="m-0" />
                        <span className="text-sm font-medium">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Field Editors */}
                <div className="space-y-4">
                  {fields.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Plus size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        No fields added yet. Choose a field type above to get
                        started.
                      </p>
                    </div>
                  ) : (
                    fields.map(renderFieldEditor)
                  )}
                </div>
              </div>
            ) : (
              /* Preview Mode */
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="space-y-6">
                  {fields.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No fields to display. Switch to edit mode to add fields.
                    </p>
                  ) : (
                    <>
                      {fields.map(renderPreviewField)}
                      <div className="pt-4 border-t">
                        <Button
                          onClick={handleSubmit}
                          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                          Submit Form
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* </div> */}
          </ScrollArea>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default FormBuilder;
