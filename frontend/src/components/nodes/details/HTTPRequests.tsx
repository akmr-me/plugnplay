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
import { Checkbox } from "@/components/ui/checkbox";
import { TestTube, Globe, Trash2, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import DetailsModal from "./Modal";
import WorkflowJSON, { getInputOrOutPutData } from "./WorkflowJSON";
import { JsonEditor } from "json-edit-react";
import { HeaderAuthTypes, HttpMethods } from "@/constants";
import { useReactFlow } from "@xyflow/react";
import { formURLFromQueryString } from "@/lib/utils";
import { WorkflowTemplateParser } from "@/lib/parser";
import httpRequest from "@/lib/executors/httpRequestTool";
import { DetailsModalProps } from "@/types";
import AuthCredentials from "@/components/AuthCredentials";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/nextjs";

// Define the expected shape for node.data.state
type HttpRequestNodeState = {
  httpMethod?: string;
  authType?: string;
  credentialId?: string;
  showToken?: boolean;
  url?: string;
  includeBody?: boolean;
  includeHeaders?: boolean;
  includeQueryParams?: boolean;
  bodyContent?: Record<string, unknown>;
  headers?: Array<{ key: string; value: string; enabled: boolean }>;
  queryParams?: Array<{ key: string; value: string; enabled: boolean }>;
};

type HttpRequestNodeData = {
  state?: HttpRequestNodeState;
  [key: string]: unknown;
};

type HttpRequestNode = {
  id: string;
  data: HttpRequestNodeData;
  [key: string]: unknown;
};

interface HttpRequestDetailsProps extends Omit<DetailsModalProps, "node"> {
  node: HttpRequestNode;
}

const parser = new WorkflowTemplateParser();

export default function HttpRequestDetals({
  setSelectedNode,
  node,
}: HttpRequestDetailsProps) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { getNodes, getEdges } = useReactFlow();
  const [loading, setLoading] = useState(false);
  const [disableConfigSaving, setDisableConfigSaving] = useState(false);
  const [inputs] = useState(() =>
    getInputOrOutPutData("input", getEdges(), node, getNodes())
  );
  const { updateNodeData } = useReactFlow();
  const [httpMethod, setHttpMethod] = useState(
    node.data?.state?.httpMethod || "GET"
  );
  const [authType, setAuthType] = useState(
    node.data?.state?.authType || "none"
  );
  const [credentialId, setCredentialId] = useState(
    node.data?.state?.credentialId || ""
  );
  const [showToken, setShowToken] = useState(
    node.data?.state?.showToken || false
  );
  const [url, setUrl] = useState(() => {
    try {
      let url = node.data?.state?.url;
      if (node.data?.state?.includeQueryParams) {
        const params = parser.parseTemplates(
          node.data?.state?.queryParams || {},
          inputs as Record<string, unknown>
        );

        url = formURLFromQueryString(url, params);
      }
      return url;
    } catch {}
    return "https://jsonplaceholder.typicode.com/todos/1";
  });

  // Checkboxes for sections
  const [includeBody, setIncludeBody] = useState(
    node.data?.state?.includeBody || false
  );
  const [includeHeaders, setIncludeHeaders] = useState(
    node.data?.state?.includeHeaders || false
  );
  const [includeQueryParams, setIncludeQueryParams] = useState(
    node.data?.state?.includeQueryParams || false
  );

  // Body content
  const [bodyContent, setBodyContent] = useState(
    node.data?.state?.bodyContent || {}
  );

  // Headers
  const [headers, setHeaders] = useState(
    node.data?.state?.headers || [
      { key: "Content-Type", value: "application/json", enabled: true },
      { key: "", value: "", enabled: false },
    ]
  );

  // Query parameters
  const [queryParams, setQueryParams] = useState(
    node.data?.state?.queryParams || [{ key: "", value: "", enabled: false }]
  );

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "", enabled: false }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_: unknown, i: number) => i !== index));
  };

  const updateHeader = (
    index: number,
    field: "key" | "value" | "enabled",
    value: string | boolean
  ) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value as never;
    setHeaders(newHeaders);
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "", enabled: false }]);
  };

  const removeQueryParam = (index: number) => {
    setQueryParams(queryParams.filter((_, i) => i !== index));
  };

  const updateQueryParam = (
    index: number,
    field: "key" | "value" | "enabled",
    value: unknown
  ) => {
    if (!url) {
      alert("Please enter a url!");
      return;
    }

    const newQueryParams = [...queryParams];
    newQueryParams[index][field] = value as never;

    const urlWithQuery = new URL(new URL(url).origin + new URL(url).pathname);

    urlWithQuery.search = "";

    setQueryParams(newQueryParams);
    const parser = new WorkflowTemplateParser();
    newQueryParams.forEach(({ key, value }) => {
      if (key) {
        key = parser.hasTemplates(key)
          ? parser.parseStringTemplates(key, inputs)
          : key;
        value = parser.hasTemplates(value)
          ? parser.parseStringTemplates(value, inputs)
          : value;
        urlWithQuery.searchParams.set(key, String(value));
      }
    });
    setUrl(urlWithQuery.toString());
  };

  const handleTestRequest = async () => {
    const token = await getToken();
    if (!token) {
      toast.error("You need to be logged in to test the request.");
      return;
    }
    if (!url) return;
    setLoading(true);
    try {
      const currentNode = {
        ...node,
        data: {
          ...node.data,
          state: {
            httpMethod,
            credentialId,
            authType,
            showToken,
            includeBody,
            includeHeaders,
            includeQueryParams,
            url,
            bodyContent,
            headers,
            queryParams,
          },
        },
      };
      await httpRequest(
        currentNode,
        { nodes: getNodes(), edges: getEdges() },
        updateNodeData,
        token,
        user?.id
      );
      toast.success("Request sent successfully!");
    } catch (error) {
      console.error("Request error:", error, { node });
      toast.error("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDisableConfigSaving(false);
  }, [
    httpMethod,
    credentialId,
    authType,
    showToken,
    includeBody,
    includeHeaders,
    includeQueryParams,
    url,
    bodyContent,
    headers,
    queryParams,
  ]);

  const handleSaveConfiguration = () => {
    try {
      console.info("configuration saved");
      setDisableConfigSaving(true);
      const urlWithPathName = new URL(url).origin + new URL(url).pathname;

      updateNodeData(node.id, {
        ...node.data,
        error: null,
        state: {
          httpMethod,
          credentialId,
          authType,
          showToken,
          includeBody,
          includeHeaders,
          includeQueryParams,
          url: urlWithPathName,
          bodyContent,
          headers,
          queryParams,
        },
      });
    } catch (error) {
      toast.error("Error saving http configuration:", {
        description: error.message,
      });
      // console.log("Error while saving http configuration", error, { node });
    }
  };

  return (
    <DetailsModal setSelectedNode={setSelectedNode}>
      <WorkflowJSON node={node} type="input" />
      <div className="w-full max-w-lg mx-auto p-4">
        <ScrollArea className="h-[600px]" onClick={(e) => e.stopPropagation()}>
          <Card className="w-full flex flex-col">
            <CardHeader className="pb-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  HTTP Request Configuration
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Ready
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* HTTP Method and URL Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={httpMethod === "GET" ? "default" : "secondary"}
                    className="font-mono text-xs px-3 py-1 min-w-fit"
                  >
                    {httpMethod}
                  </Badge>
                  <div className="flex-1 text-sm font-mono text-muted-foreground break-all">
                    {url}
                  </div>
                </div>
              </div>

              {/* HTTP Method Select */}
              <div className="space-y-2 w-full">
                <Label htmlFor="http-method" className="text-sm font-medium">
                  HTTP Method
                </Label>
                <Select value={httpMethod} onValueChange={setHttpMethod}>
                  <SelectTrigger id="http-method" className="w-full">
                    <SelectValue placeholder="Select HTTP method" />
                  </SelectTrigger>
                  <SelectContent>
                    {HttpMethods.map((method) => (
                      <SelectItem
                        key={method.value}
                        value={method.value}
                        disabled={!method.enabled}
                        className={!method.enabled ? "opacity-50" : ""}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{method.label}</span>
                          {!method.enabled && (
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

              {/* URL Section */}
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium">
                  URL
                </Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="font-mono text-sm"
                  placeholder="https://api.example.com/endpoint"
                />
              </div>

              {/* Auth Type Section */}
              <div className="space-y-2 w-full">
                <Label htmlFor="auth-type" className="text-sm font-medium">
                  Authentication Type
                </Label>
                <Select value={authType} onValueChange={setAuthType}>
                  <SelectTrigger id="auth-type" className="w-full">
                    <SelectValue placeholder="Select auth type" />
                  </SelectTrigger>
                  <SelectContent>
                    {HeaderAuthTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Auth Token Section - Only show if auth type is not 'none' */}
              {authType !== "none" && (
                <div className="space-y-2">
                  <AuthCredentials
                    authToken={credentialId}
                    setAuthToken={setCredentialId}
                  />
                </div>
              )}

              {/* Options Checkboxes */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Request Options</Label>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-body"
                      checked={includeBody}
                      onCheckedChange={setIncludeBody}
                    />
                    <Label htmlFor="include-body" className="text-sm">
                      Include Body
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-headers"
                      checked={includeHeaders}
                      onCheckedChange={setIncludeHeaders}
                    />
                    <Label htmlFor="include-headers" className="text-sm">
                      Include Headers
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-query-params"
                      checked={includeQueryParams}
                      onCheckedChange={setIncludeQueryParams}
                    />
                    <Label htmlFor="include-query-params" className="text-sm">
                      Include Query Params
                    </Label>
                  </div>
                </div>
              </div>

              {/* Body Section */}
              {includeBody && (
                <div className="space-y-2">
                  <Label htmlFor="body-content" className="text-sm font-medium">
                    Request Body (application/json)
                  </Label>
                  {/* <Textarea
                    id="body-content"
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    placeholder="Enter JSON body content..."
                    className="min-h-[120px] font-mono text-sm"
                  /> */}
                  <JsonEditor data={bodyContent} setData={setBodyContent} />
                </div>
              )}

              {/* Headers Section */}
              {includeHeaders && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Headers</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHeader}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Header
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {headers.map((header, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Header name"
                          value={header.key}
                          onChange={(e) =>
                            updateHeader(index, "key", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Input
                          placeholder="Header value"
                          value={header.value}
                          onChange={(e) =>
                            updateHeader(index, "value", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHeader(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Query Parameters Section */}
              {includeQueryParams && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Query Parameters
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQueryParam}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Parameter
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {queryParams.map((param, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Parameter name"
                          value={param.key}
                          onChange={(e) =>
                            updateQueryParam(index, "key", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Input
                          placeholder="Parameter value"
                          value={param.value}
                          onChange={(e) =>
                            updateQueryParam(index, "value", e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQueryParam(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={handleSaveConfiguration}
                  disabled={disableConfigSaving}
                >
                  Save Configuration
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  disabled={loading}
                  loading={loading}
                  onClick={handleTestRequest}
                >
                  <TestTube className="h-3 w-3" />
                  Test Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>
      <WorkflowJSON node={node} type="output" />
    </DetailsModal>
  );
}
