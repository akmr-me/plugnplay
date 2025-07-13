import { Label } from "@/components/ui/label";
import FieldInput from "./FieldInput";
import { FieldType } from "@/types";

type PreviewFieldProps = {
  field: FieldType;
  setFormResponses: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  formResponses: Record<string, string>;
};

const PreviewField = ({
  field,
  setFormResponses,
  formResponses,
}: PreviewFieldProps) => {
  return (
    <div key={field.id} className="space-y-2">
      <Label className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <FieldInput
        field={field}
        setFormResponses={setFormResponses}
        formResponses={formResponses}
      />
    </div>
  );
};
export default PreviewField;
