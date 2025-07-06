import { WorkflowTemplateParser } from "../parser";

const parser = new WorkflowTemplateParser();

export default function parseKeyValue(input, context) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      parser.hasTemplates(key)
        ? parser.parseStringTemplates(key, context)
        : key,
      parser.hasTemplates(value)
        ? parser.parseStringTemplates(value, context)
        : value,
    ])
  );
}
