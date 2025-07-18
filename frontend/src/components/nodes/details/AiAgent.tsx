"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

import {
  Eye,
  EyeOff,
  Settings,
  Copy,
  TestTube,
  Brain,
  Zap,
} from "lucide-react";
import DetailsModal from "./Modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import WorkflowJSON from "./WorkflowJSON";
import { useAuth, useUser } from "@clerk/nextjs";
import AuthCredentials from "@/components/AuthCredentials";
import { useReactFlow } from "@xyflow/react";
import { handleTestNode } from "@/service/node";
import { toast } from "sonner";

export default function OpenAIDetails({ setSelectedNode, node }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { getNodes, getEdges, updateNodeData } = useReactFlow();

  // OpenAI Configuration States
  const [description, setDescription] = useState(
    node.data.state?.description || ""
  );
  const [model, setModel] = useState(node.data.state?.model || "gpt-4");
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
  const openAIModels = [
    { value: "gpt-4", label: "GPT-4", enabled: true },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo", enabled: true },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", enabled: true },
    { value: "gpt-4o", label: "GPT-4o", enabled: true },
    { value: "gpt-4o-mini", label: "GPT-4o Mini", enabled: true },
    { value: "dall-e-3", label: "DALL-E 3", enabled: false },
    { value: "whisper-1", label: "Whisper", enabled: false },
  ];

  // Response Format Options
  const responseFormats = [
    { value: "text", label: "Text", disabled: true },
    { value: "json", label: "JSON" },
    { value: "structured", label: "Structured", disabled: true },
  ];

  //   const copyToClipboard = async (text) => {
  //     try {
  //       await navigator.clipboard.writeText(text);
  //       console.info("Copied to clipboard:", text);
  //     } catch (err) {
  //       console.error("Failed to copy to clipboard");
  //     }
  //   };

  //   useEffect(() => {
  //     async function getOpenAIConfig() {
  //       const token = await getToken();
  //       if (!token) return;
  //       try {
  //         // Replace with your actual API call
  //         // const response = await getOpenAIConfig(token, node.workflowId);
  //         // if (response) {
  //         //   setApiKeyName(response.apiKeyName || "");
  //         //   setDescription(response.description || "");
  //         //   setModel(response.model || "gpt-4");
  //         //   setPrompt(response.prompt || "");
  //         //   setTemperature(response.temperature || 0.7);
  //         //   setMaxTokens(response.maxTokens || 1000);
  //         //   setSystemPrompt(response.systemPrompt || "");
  //         //   setResponseFormat(response.responseFormat || "text");
  //         // }
  //         console.log("Loading OpenAI configuration...");
  //       } catch (error) {
  //         console.log("Error loading OpenAI config:", error);
  //       }
  //     }
  //     getOpenAIConfig();
  //   }, []);

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
      });
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

    try {
      // Replace with your actual test API call
      const resposne = await handleTestNode(node.workflowId, node.data.state);
      updateNodeData(node.id, { ...node.data, output: resposne });
      console.log("Testing OpenAI configuration...", response);
    } catch (error) {
      console.error("Error testing OpenAI config:", error);
    }
  };

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
              >
                <Settings className="h-3 w-3 mr-1" />
                Save Configuration
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleTestConfiguration}
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
