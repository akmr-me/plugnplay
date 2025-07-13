import { Note } from "@/components/Note";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { findUpstreamNodes } from "@/lib/utils";
import { AppNode } from "@/types";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import { githubDarkTheme, JsonEditor } from "json-edit-react";
import { FileJson2 } from "lucide-react";
import React, { useEffect, useState } from "react";

type WorkflowInput = {
  node: AppNode;
  setDate?: React.Dispatch<React.SetStateAction<unknown>>;
  type: "input" | "output";
  shouldRender?: boolean;
};

export function getInputOrOutPutData(
  type: string,
  edges: Edge[],
  node: Node,
  nodes: Node[]
) {
  if (!node) return null;
  if (type == "input" && node.type?.includes("trigger")) return null;
  if (type == "output") return node.data.output;
  if (type == "input") {
    console.log("input");
    const upStreamNodeIds = findUpstreamNodes(node.id, edges);
    console.log({ upStreamNodeIds });
    return upStreamNodeIds.reduce((acc, nodeId) => {
      const node = nodes.find((node) => node.id === nodeId);
      return { ...acc, [node.type]: node?.data.output };
    }, {});
  }
}

function WorkflowInput({ node, type, shouldRender }: WorkflowInput) {
  const { getNodes, getEdges } = useReactFlow();
  const [data, setData] = useState(() =>
    getInputOrOutPutData(type, getEdges(), node, getNodes())
  );
  console.log("WorkflowInput", { node, data });
  useEffect(() => {
    setData(getInputOrOutPutData(type, getEdges(), node, getNodes()));
  }, [shouldRender]);
  if (type == "input" && node?.type?.includes("trigger")) return null;
  return (
    <ScrollArea
      className="w-full max-w-lg mx-auto max-h-[580px]!"
      onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
    >
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileJson2 className="h-5 w-5" />
              {type?.toUpperCase()}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <JsonEditor
            data={data}
            theme={githubDarkTheme}
            enableClipboard={(item) => {
              const path = item.path;
              const copyText = `"{{ $${path.join(".")} }}"`;
              navigator.clipboard.writeText(copyText);
              return "amresh";
            }}
            {...(type === "input" && { restrictEdit: true })}
          />
        </CardContent>
        <CardFooter>
          <Note>To copy path hover on the key click to copy icon.</Note>
        </CardFooter>
      </Card>
      {shouldRender && ""}
    </ScrollArea>
  );
}

export default WorkflowInput;
