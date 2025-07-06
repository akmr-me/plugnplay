import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitBranch, Plus, X, TestTube2, Settings } from "lucide-react";
import { DetailsModalProps } from "@/types";
import { conditionOperators, logicalOperators } from "@/constants";
import DetailsModal from "./Modal";
import WorkflowJSON, { getInputOrOutPutData } from "./WorkflowJSON";
import { useReactFlow } from "@xyflow/react";
import ifConditionTool from "@/lib/executors/ifConditionTool";

export default function IfConditionDetails({
  setSelectedNode,
  node,
}: DetailsModalProps) {
  const { getEdges, getNodes, updateNodeData } = useReactFlow();
  const [inputs] = useState(() =>
    getInputOrOutPutData("input", getEdges(), node, getNodes())
  );
  const [conditions, setConditions] = useState([
    { id: 1, field: "", operator: "equals", value: "" },
  ]);
  const [logicalOperator, setLogicalOperator] = useState([undefined, "and"]);
  const [conditionStatus, setConditionStatus] = useState("active");
  console.log({ conditions });
  const addCondition = () => {
    const newCondition = {
      id: Date.now(),
      field: "",
      operator: "equals",
      value: "",
    };
    setConditions([...conditions, newCondition]);
    setLogicalOperator([...logicalOperator, "and"]);
  };

  const removeCondition = (id: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((condition) => condition.id !== id));
      // Remove Logical Oprator
      const indexToBeRemoved = conditions.findIndex(
        ({ id: identifier }) => id == identifier
      );
      console.log({ indexToBeRemoved });
      const tempArr = [...logicalOperator];
      tempArr.splice(indexToBeRemoved, 1);
      setLogicalOperator(tempArr);
    }
  };

  const updateCondition = (id: number, field: string, value: string) => {
    setConditions(
      conditions.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition
      )
    );
  };

  const getConditionPreview = () => {
    if (conditions.length === 0) return "No conditions set";

    const conditionTexts = conditions.map((condition, index) => {
      const operatorLabel =
        conditionOperators.find((op) => op.value === condition.operator)
          ?.description || condition.operator;
      return `${
        index == 0 ? "" : logicalOperator[index]?.toUpperCase() || "AND"
      } ${condition.field || "[field]"} ${operatorLabel} ${
        condition.value || "[value]"
      }`;
    });

    return conditionTexts.join(` `);
  };

  const handleTestCondition = () => {
    ifConditionTool(
      {
        ...node,
        data: { ...node.data, state: { conditions, logicalOperator } },
      },
      { nodes: getNodes(), edges: getEdges() },
      updateNodeData
    );
  };
  const handleSaveCondition = () => {
    updateNodeData(node.id, {
      ...node.data,
      state: { conditions, logicalOperator },
    });
  };
  console.log({ logicalOperator });
  return (
    <DetailsModal setSelectedNode={setSelectedNode}>
      <WorkflowJSON node={node} type="input" />
      <Card className="w-full">
        <ScrollArea
          className="w-full max-w-lg mx-auto max-h-[600px]"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                IF Condition Configuration
              </CardTitle>
              <Badge
                variant={conditionStatus === "active" ? "default" : "secondary"}
                className="text-xs"
              >
                {conditionStatus === "active" ? "Active" : "Disabled"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Logical Operator (shown only when multiple conditions) */}
            {/* {conditions.length > 1 && (
              <div className="space-y-2">
                <Label
                  htmlFor="logical-operator"
                  className="text-sm font-medium"
                >
                  Logical Operator
                </Label>
                <Select
                  value={logicalOperator}
                  onValueChange={setLogicalOperator}
                >
                  <SelectTrigger id="logical-operator" className="w-full">
                    <SelectValue placeholder="Select logical operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {logicalOperators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        <div className="flex flex-col items-start">
                          <span>{op.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {op.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )} */}

            {/* Conditions List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Conditions</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Condition
                </Button>
              </div>

              {conditions.map((condition, index) => (
                <div key={condition.id} className="space-y-2">
                  {/* Show logical operator between conditions */}
                  {index > 0 && (
                    <div className="flex justify-center">
                      {/* <Badge variant="outline" className="text-xs"> */}
                      {conditions.length > 1 && (
                        <div className="space-y-2">
                          {/* <Label
                              htmlFor="logical-operator"
                              className="text-sm font-medium"
                            >
                              Logical Operator
                            </Label> */}
                          <Select
                            value={logicalOperator[index]}
                            onValueChange={(e: string) => {
                              console.log({ e, logicalOperator, index });

                              setLogicalOperator((prev) =>
                                prev.map((item, i) => (i == index ? e : item))
                              );
                            }}
                            defaultValue="and"
                          >
                            <SelectTrigger
                              id="logical-operator"
                              className="w-full"
                            >
                              <SelectValue placeholder="Select logical operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {logicalOperators.map((op) => (
                                <SelectItem key={op.value} value={op.value}>
                                  <div className="flex flex-col items-start">
                                    <span>{op.label}</span>
                                    {/* <span className="text-xs text-muted-foreground">
                                      {op.description}
                                    </span> */}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {/* </Badge> */}
                    </div>
                  )}

                  <div className="flex gap-2 items-start">
                    {/* Field Input */}
                    <div className="flex-1">
                      <Input
                        placeholder="Field name"
                        value={condition.field}
                        onChange={(e) =>
                          updateCondition(condition.id, "field", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Operator Select */}
                    <div className="flex-1">
                      <Select
                        value={condition.operator}
                        onValueChange={(value) =>
                          updateCondition(condition.id, "operator", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionOperators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              <div className="flex flex-col items-start">
                                <span>{op.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {op.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Value Input */}
                    <div className="flex-1">
                      <Input
                        placeholder="Value"
                        value={condition.value}
                        onChange={(e) =>
                          updateCondition(condition.id, "value", e.target.value)
                        }
                        className="w-full"
                        disabled={
                          condition.operator === "is_empty" ||
                          condition.operator === "is_not_empty"
                        }
                      />
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCondition(condition.id)}
                      disabled={conditions.length === 1}
                      className="p-1 h-8 w-8"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Condition Preview */}
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Condition Preview</span>
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                {getConditionPreview()}
              </div>
            </div>

            {/* Condition Status Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Condition Status</span>
              </div>
              <Button
                variant={conditionStatus === "active" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setConditionStatus(
                    conditionStatus === "active" ? "disabled" : "active"
                  )
                }
              >
                {conditionStatus === "active" ? "Active" : "Disabled"}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                size="sm"
                onClick={handleSaveCondition}
              >
                Save Condition
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleTestCondition}
              >
                <TestTube2 className="h-3 w-3" />
                Test Condition
              </Button>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
      <WorkflowJSON node={node} type="output" />
    </DetailsModal>
  );
}
