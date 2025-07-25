"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import { Settings, TestTube, Brain } from "lucide-react";
import DetailsModal from "./Modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import WorkflowJSON, { getInputOrOutPutData } from "./WorkflowJSON";
import { useAuth } from "@clerk/nextjs";
import AuthCredentials from "@/components/AuthCredentials";
import { useReactFlow } from "@xyflow/react";
import { handleTestNode } from "@/service/node";
import { toast } from "sonner";
import { WorkflowTemplateParser } from "@/lib/parser";
import { openAIModels, responseFormats } from "@/constants";

type OpenAIDetailsProps = {
  setSelectedNode: (node: unknown) => void;
  node: unknown;
};

export default function OpenAIDetails({
  setSelectedNode,
  node,
}: OpenAIDetailsProps) {
  const { getToken } = useAuth();
  const { getNodes, getEdges, updateNodeData } = useReactFlow();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(true);

  // OpenAI Configuration States
  const [description, setDescription] = useState(
    node.data.state?.description || ""
  );
  const [model, setModel] = useState(node.data.state?.model || "gpt-4o");
  const [prompt, setPrompt] = useState(node.data.state?.prompt || "");
  //   const [temperature, setTemperature] = useState(0.7);
  //   const [maxTokens, setMaxTokens] = useState(1000);
  //   const [showApiKey, setShowApiKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    node.data.state?.system_prompt || ""
  );
  const [responseFormat, setResponseFormat] = useState(
    node.data.state?.responseFormat || "json"
  );
  const [credentialId, setCredentialId] = useState(
    node.data.state?.credential_id || ""
  );

  // Available OpenAI Models

  const handleSaveOpenAIConfiguration = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const state = {
        credential_id: credentialId,
        description,
        model,
        prompt,
        system_prompt: systemPrompt,
        response_format: responseFormat,
      };
      updateNodeData(node.id, {
        ...node.data,
        state: state,
        error: null,
      });
      setSaved(true);
      toast.info("OpenAI configuration saved successfully!");
    } catch (error) {
      toast.error("Error saving OpenAI config:", {
        description: error.message,
      });
    }
  };

  const handleTestConfiguration = async () => {
    const token = await getToken();
    if (!token) return;
    if (!saved) {
      const userConfirmation = confirm(
        "You have unsaved changes. Do you want to save them before testing?"
      );
      if (userConfirmation) {
        await handleSaveOpenAIConfiguration();
      }
    }
    const parser = new WorkflowTemplateParser();
    const flow = {
      nodes: getNodes(),
      edges: getEdges(),
    };
    const input = getInputOrOutPutData(
      "input",
      flow.edges,
      node,
      flow.nodes
    ) as Record<string, unknown>;

    try {
      setLoading(true);
      toast("Testing OpenAI configuration started...");
      // Replace with your actual test API call
      const convertedState = parser.parseTemplates(node.data.state, input);
      const resposne = await handleTestNode(node.workflowId, convertedState);
      updateNodeData(node.id, { ...node.data, output: resposne });
    } catch (error) {
      console.error("Error testing OpenAI config:", error);
      toast.error("Error testing OpenAI configuration:", {
        description: error.message,
      });
    } finally {
      setLoading(false);
      toast.success("OpenAI configuration tested successfully!");
    }
  };

  useEffect(() => {
    setSaved(false);
  }, [
    loading,
    description,
    model,
    prompt,
    systemPrompt,
    responseFormat,
    credentialId,
  ]);

  return (
    <DetailsModal setSelectedNode={setSelectedNode}>
      <WorkflowJSON node={node} type="input" />
      <ScrollArea
        className="w-full max-w-md mx-auto h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5" />
                OpenAI Configuration
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* API Key Name Section */}
            <div className="space-y-2">
              {/* <Label htmlFor="api-key-name" className="text-sm font-medium">
                API Key Name
              </Label>
              <div className="relative">
                <Input
                  id="api-key-name"
                  value={apiKeyName}
                  onChange={(e) => setApiKeyName(e.target.value)}
                  placeholder="Enter API key name"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => copyToClipboard(apiKeyName)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div> */}
              <AuthCredentials
                authToken={credentialId}
                setAuthToken={setCredentialId}
              />
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this OpenAI integration..."
                className="min-h-[60px] resize-none"
              />
            </div>

            {/* Model Selection */}
            <div className="space-y-2 w-full">
              <Label htmlFor="model" className="text-sm font-medium">
                Model
              </Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model" className="w-full">
                  <SelectValue placeholder="Select OpenAI model" />
                </SelectTrigger>
                <SelectContent>
                  {openAIModels.map((modelOption) => (
                    <SelectItem
                      key={modelOption.value}
                      value={modelOption.value}
                      disabled={!modelOption.enabled}
                      className={!modelOption.enabled ? "opacity-50" : ""}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{modelOption.label}</span>
                        {!modelOption.enabled && (
                          <Badge variant="outline" className="text-xs ml-2">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* System Prompt Section */}
            <div className="space-y-2">
              <Label htmlFor="system-prompt" className="text-sm font-medium">
                System Prompt
              </Label>
              <Textarea
                id="system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant that..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* User Prompt Section */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm font-medium">
                User Prompt
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Temperature Setting */}
            {/* <div className="space-y-2">
              <Label htmlFor="temperature" className="text-sm font-medium">
                Temperature ({temperature})
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">0</span>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">2</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Higher values make output more random, lower values more
                deterministic
              </p>
            </div> */}

            {/* Max Tokens Setting */}
            {/* <div className="space-y-2">
              <Label htmlFor="max-tokens" className="text-sm font-medium">
                Max Tokens
              </Label>
              <Input
                id="max-tokens"
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                min="1"
                max="4096"
                placeholder="1000"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of tokens to generate (1-4096)
              </p>
            </div> */}

            {/* Response Format */}
            <div className="space-y-2 w-full">
              <Label htmlFor="response-format" className="text-sm font-medium">
                Response Format
              </Label>
              <Select value={responseFormat} onValueChange={setResponseFormat}>
                <SelectTrigger id="response-format" className="w-full">
                  <SelectValue placeholder="Select response format" />
                </SelectTrigger>
                <SelectContent>
                  {responseFormats.map((format) => (
                    <SelectItem
                      key={format.value}
                      value={format.value}
                      disabled={format.disabled}
                    >
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                size="sm"
                onClick={handleSaveOpenAIConfiguration}
                disabled={saved || loading}
              >
                <Settings className="h-3 w-3 mr-1" />
                Save Configuration
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleTestConfiguration}
                loading={loading}
                disabled={loading}
              >
                <TestTube className="h-3 w-3" />
                Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
      <WorkflowJSON node={node} type="output" />
    </DetailsModal>
  );
}
