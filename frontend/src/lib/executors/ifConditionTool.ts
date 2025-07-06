import { getInputOrOutPutData } from "@/components/nodes/details/WorkflowJSON";
import { Flow } from "@/types";
import { Node } from "@xyflow/react";
import { WorkflowTemplateParser } from "../parser";

export default async function ifConditionTool(
  currentNode: Node,
  flow: Flow,
  updateNodeData: (
    id: string,
    data: Record<string, unknown>
  ) => Promise<unknown>
): Promise<boolean> {
  const input = getInputOrOutPutData(
    "input",
    flow.edges,
    currentNode,
    flow.nodes
  ) as Record<string, unknown>;

  const { conditions, logicalOperator } = currentNode.data.state as {
    logicalOperator: string[];
    conditions: { field: unknown; value: unknown; operator: unknown };
  };
  let val = false;
  const parser = new WorkflowTemplateParser();
  console.log({ val });
  for (const index in conditions) {
    let { field, value, operator } = conditions[index];
    field = parser.hasTemplates(field)
      ? parser.parseStringTemplates(field, input)
      : field;
    value = parser.hasTemplates(value)
      ? parser.parseStringTemplates(value, input)
      : value;
    console.log({ field, value });
    val = getBooleanFromStringCondition(field, operator, value);
    const LogicalOprator = logicalOperator[index];
    if (!LogicalOprator) break;
    if (LogicalOprator == "or" && val) break;
    if (LogicalOprator == "and" && !val) break;
  }
  updateNodeData(currentNode.id, {
    ...currentNode.data,
    output: { condition: val },
  });
  return val;
}
function getBooleanFromStringCondition(
  left: string,
  condition: string,
  right: string
): boolean {
  switch (condition) {
    case "equals":
      return left == right;
    case "not_equals":
      return left != right;
    case "contains":
      return left.includes(right);
    case "not_contains":
      return !left.includes(right);
    case "starts_with":
      return left.startsWith(right);
    case "ends_with":
      return left.endsWith(right);
    case "greater_than":
      return left > right;
    case "less_than":
      return left < right;
    case "greater_equal":
      return left >= right;
    case "less_equal":
      return left <= right;
    case "is_empty":
      return !left || left.toString().trim() === "";
    case "is_not_empty":
      return !!left && left.toString().trim() !== "";
    case "regex_match":
      try {
        const regex = new RegExp(left);
        return regex.test(String(right));
      } catch {
        return false; // invalid regex
      }

    default:
      return false;
  }
}
// "".is;
// const conditionOperators = [
//   { value: "is_empty", label: "is empty", description: "is empty" },
//   { value: "is_not_empty", label: "is not empty", description: "is not empty" },
//   {
//     value: "regex_match",
//     label: "regex match",
//     description: "matches regex pattern",
//   },
// ];
