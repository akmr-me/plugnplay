import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Code,
  Play,
  Save,
  RotateCcw,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Upload,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import DetailsModal from "./Modal";
import WorkflowJSON, { getInputOrOutPutData } from "./WorkflowJSON";
import { WorkflowTemplateParser } from "@/lib/parser";
import { useReactFlow } from "@xyflow/react";

export default function JavascriptEditorDetails({ setSelectedNode, node }) {
  const { getNodes, getEdges, updateNodeData } = useReactFlow();
  const [inputs] = useState(() => {
    return getInputOrOutPutData("input", getEdges(), node, getNodes());
  });
  const [code, setCode] = useState(
    node?.data.state.code ||
      `function processData(input) {
  // Your JavaScript code here
  console.log('Processing:', input);
  
  // Example: Transform data
  const result = {
    processed: true,
    timestamp: new Date().toISOString(),
    data: input
  };
  
  return result;
}`
  );

  const [functionName, setFunctionName] = useState(
    node?.data.state.functionName || "processData"
  );
  const [description, setDescription] = useState(
    node?.data?.state?.description ||
      "Process incoming data and return transformed result"
  );
  const [testInput, setTestInput] = useState(
    node?.data.state.testInput || '{"name": "John", "age": 30}'
  );
  const [testOutput, setTestOutput] = useState(
    node?.data.state.testOutput || ""
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState("");
  const [executionSuccess, setExecutionSuccess] = useState(false);
  console.log("test input", testInput);
  const highlightCode = (code: string) =>
    Prism.highlight(code, Prism.languages.javascript, "javascript");

  const executeCode = async () => {
    setIsExecuting(true);
    setExecutionError("");
    setExecutionSuccess(false);

    const context = getInputOrOutPutData("input", getEdges(), node, getNodes());
    console.log({ context });

    try {
      // Create a safe execution environment
      const func = new Function(
        "input",
        `
        ${code}
        return ${functionName}(input);
        `
      );
      const parser = new WorkflowTemplateParser();
      console.log({ context });
      const input = JSON.parse(testInput);
      const parsedInput = Object.fromEntries(
        Object.entries(input).map(([key, value]) => [
          key,
          parser.hasTemplates(value)
            ? parser.parseStringTemplates(value, context)
            : value,
        ])
      );
      console.log("parsedInput", parsedInput);
      const result = func(parsedInput);
      updateNodeData(node.id, { ...node.data, output: result });
      setTestOutput(JSON.stringify(result, null, 2));
      setExecutionSuccess(true);
    } catch (error) {
      setExecutionError(error.message);
      setTestOutput("");
    } finally {
      setIsExecuting(false);
    }
  };

  const resetCode = () => {
    setCode(`function processData(input) {
  // Your JavaScript code here
  console.log('Processing:', input);
  
  // Example: Transform data
  const result = {
    processed: true,
    timestamp: new Date().toISOString(),
    data: input
  };
  
  return result;
}`);
    setTestOutput("");
    setExecutionError("");
    setExecutionSuccess(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${functionName}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };
  function saveCode() {
    updateNodeData(node.id, {
      ...node.data,
      state: { code, functionName, description, testInput, testOutput },
    });
  }
  return (
    <DetailsModal setSelectedNode={setSelectedNode}>
      <WorkflowJSON node={node} type="input" />
      <div className="w-full max-w-4xl mx-auto p-4">
        <ScrollArea className="h-[600px]">
          <Card
            className="w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  JavaScript Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                  {executionSuccess && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Executed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <div className="px-6 pb-6">
              <div className="space-y-6">
                {/* Function Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="function-name"
                      className="text-sm font-medium"
                    >
                      Function Name
                    </Label>
                    <Input
                      id="function-name"
                      value={functionName}
                      onChange={(e) => setFunctionName(e.target.value)}
                      className="font-mono text-sm"
                      placeholder="functionName"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="text-sm"
                      placeholder="Describe what this function does"
                    />
                  </div>
                </div>

                {/* Code Editor with react-simple-code-editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      JavaScript Code
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyCode}
                        className="h-8"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadCode}
                        className="h-8"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetCode}
                        className="h-8"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Editor
                      value={code}
                      onValueChange={setCode}
                      highlight={highlightCode}
                      padding={12}
                      style={{
                        fontFamily: '"Fira Code", monospace',
                        fontSize: 14,
                        backgroundColor: "#2d2d2d",
                        color: "#ffffff",
                        borderRadius: 8,
                      }}
                    />
                  </div>
                </div>

                {/* Test Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Test & Execute
                    </Label>
                    <Button
                      onClick={executeCode}
                      disabled={isExecuting}
                      className="h-8"
                      size="sm"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {isExecuting ? "Executing..." : "Run Test"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="test-input"
                        className="text-sm font-medium"
                      >
                        Test Input (JSON)
                      </Label>
                      <Textarea
                        id="test-input"
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        className="min-h-[100px] font-mono text-sm"
                        placeholder='{"key": "value"}'
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="test-output"
                        className="text-sm font-medium"
                      >
                        Output
                      </Label>
                      <Textarea
                        id="test-output"
                        value={testOutput}
                        readOnly
                        className="min-h-[100px] font-mono text-sm bg-muted"
                        placeholder="Output will appear here..."
                      />
                    </div>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {executionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Execution Error:</strong> {executionError}
                    </AlertDescription>
                  </Alert>
                )}

                {executionSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Code executed successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {/* Documentation */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Usage Notes
                  </Label>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        Your function will receive input from the previous
                        workflow step
                      </li>
                      <li>
                        Return data will be passed to the next step in the
                        workflow
                      </li>
                      <li>
                        Use console.log() for debugging (visible in execution
                        logs)
                      </li>
                      <li>
                        Handle errors with try-catch blocks for robust execution
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" size="sm" onClick={saveCode}>
                    <Save className="h-3 w-3 mr-1" />
                    Save Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={executeCode}
                    disabled={isExecuting}
                    className="flex items-center gap-1"
                  >
                    <Play className="h-3 w-3" />
                    Test Execute
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </ScrollArea>
      </div>
      <WorkflowJSON node={node} type="output" />
    </DetailsModal>
  );
}
