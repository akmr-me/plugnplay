"use client";
import React, { useEffect, useState } from "react";
import { Plus, Eye, Edit3, XIcon, FormInput } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Node, useReactFlow } from "@xyflow/react";
import { AppNode, FieldType, ValidField } from "@/types";
import WorkflowJSON from "./WorkflowJSON";
import DetailsModal from "./Modal";
import UrlCopyComponent from "@/components/UrlCopyComponent";
import useDebounceCallback from "@/hooks/useDebounceCallback";
import {
  createFormField,
  createFormTrigger,
  deleteFormField,
  testSubmitForm,
  updateFormTrigger,
} from "@/service/node";
import { useAuth } from "@clerk/nextjs";
import { fieldTypes } from "@/constants";
import FieldEditor from "./form/FieldEditor";
import PreviewField from "./form/PreviewField";

const FormBuilder = ({
  node,
  setSelectedNode,
}: {
  node: Node & { workflowId: string };
  setSelectedNode: React.SetStateAction<AppNode | undefined>;
}) => {
  const { id, data } = node;
  const { getToken } = useAuth();
  const { updateNodeData } = useReactFlow();
  const [shouldRerender, setShouldRerender] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formTitle, setFormTitle] = useState<string>(
    (data.state?.formTitle as string) || "Untitled Form"
  );
  const [formDescription, setFormDescription] = useState<string>(
    (data.state?.formDescription as string) || ""
  );
  const [fields, setFields] = useState<FieldType[]>(
    (data.fields as FieldType[]) || []
  );
  const [formResponses, setFormResponses] = useState<Record<string, string>>(
    {}
  );

  const addField = async (type: ValidField) => {
    const token = await getToken();
    if (!token) return;
    const newField = await createFormField(
      token,
      node.workflowId,
      type,
      fields.length + 1,
      false
    );

    setFields([...fields, newField]);
    updateNodeData(id, {
      ...node.data,
      state: { ...(node.data?.state || {}), fields: [...fields, newField] },
    });
  };

  const validateForm = () => {
    const requiredFields = fields.filter((field) => field.required);
    console.log("requiredFields", requiredFields, formResponses);
    const missingFields = requiredFields.filter((field) => {
      return (
        !formResponses[field.id] ||
        formResponses[field.id].toString().trim() === ""
      );
    });
    return missingFields;
  };
  console.log("formResponses", formResponses);
  const handleSubmit = async () => {
    const missingFields = validateForm();
    console.log({ missingFields });
    if (missingFields.length > 0) {
      alert(
        `Please fill in the following required fields: ${missingFields
          .map((f) => f.label)
          .join(", ")}`
      );
      return;
    }

    try {
      console.log({ formResponses });
      const token = await getToken();
      if (!token) return;
      const response = await testSubmitForm(
        token,
        node.workflowId,
        formResponses
      );
      // const testFormData = await testSubmitForm(node.workflowId, formResponses);
      console.log({ response });
      updateNodeData(node.id, { ...node.data, output: response });
      setShouldRerender((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
    alert("Form submitted successfully!" + node.id);
  };
  console.log("node is updated", node);

  const closeDialog = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof setSelectedNode === "function") {
      setSelectedNode(undefined);
    }
  };

  const debouncedUpdateForm = useDebounceCallback(updateFormTrigger, 400);

  useEffect(() => {
    const updateForm = async () => {
      const token = await getToken();
      if (!token) return;
      const {
        title,
        description,
        id,
        fields: serverFields,
      } = await createFormTrigger(
        token,
        formTitle,
        node.workflowId,
        formDescription
      );
      console.log(
        "form",
        { title, description, id },
        {
          fields: serverFields,
          formDescription: description,
          formTitle: title,
          formId: node.workflowId,
        }
      );
      updateNodeData(id, {
        ...node.data,
        state: {
          fields: serverFields,
          formDescription: description,
          formTitle: title,
          formId: node.workflowId,
        },
      });
      setFields(serverFields);
    };
    updateForm();
  }, []);

  const formURL = process.env.NEXT_PUBLIC_API_URL + "form/" + node.workflowId;

  const handleChangeFormTitle = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const title = e.target.value;
    if (!title) return;
    setFormTitle(e.target.value);
    updateNodeData(id, {
      ...node.data,
      state: {
        ...(node.data?.state || {}),
        formTitle: title,
      },
    });
    const token = await getToken();
    if (!token) return;
    debouncedUpdateForm(token, node.workflowId, title);
  };
  const handleChangeFormDescription = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const description = e.target.value;
    if (!description) return;
    setFormDescription(e.target.value);
    updateNodeData(id, {
      ...node.data,
      state: {
        ...(node.data?.state || {}),
        formDescription: description,
      },
    });
    const token = await getToken();
    if (!token) return;
    debouncedUpdateForm(token, node.workflowId, undefined, description);
  };

  const deleteField = async (id: string) => {
    const token = await getToken();
    if (!token) return;
    await deleteFormField(token, node.workflowId, id);
    setFields(fields.filter((field) => field.id !== id));
    const newResponses = { ...formResponses };
    delete newResponses[id];
    setFormResponses(newResponses);
  };

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
              <UrlCopyComponent url={formURL} />
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
                        onChange={handleChangeFormTitle}
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
                        onChange={handleChangeFormDescription}
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
                    {fields?.length === 0 ? (
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
                      fields.map((field) => (
                        <FieldEditor
                          field={field}
                          key={field.id}
                          setFields={setFields}
                          workflowId={node.workflowId}
                          deleteField={deleteField}
                        />
                      ))
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
                        {fields.map((field) => (
                          <PreviewField
                            key={field.id}
                            setFormResponses={setFormResponses}
                            formResponses={formResponses}
                            field={field}
                          />
                        ))}
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
      <WorkflowJSON node={node} type="output" shouldRender={shouldRerender} />
    </DetailsModal>
  );
};

export default FormBuilder;
