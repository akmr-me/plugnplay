import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldType } from "@/types";

type FieldInputProps = {
  field: FieldType;
  setFormResponses: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  formResponses: Record<string, string>;
};

const FieldInput = ({
  field,
  setFormResponses,
  formResponses,
}: FieldInputProps) => {
  const handleFormResponse = (
    fieldId: string,
    value: string,
    label: string
  ) => {
    setFormResponses((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };
  const commonProps = {
    value: formResponses[field.id as string] || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleFormResponse(String(field.id), e.target.value, field.label!),
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

export default FieldInput;
