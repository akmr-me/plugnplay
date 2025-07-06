import { useState } from "react";
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
import { Eye, EyeOff, Settings, Copy, TestTube } from "lucide-react";
import DetailsModal from "./Modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import WorkflowJSON from "./WorkflowJSON";

export default function WebhookDetails({ setSelectedNode }) {
  const [httpMethod, setHttpMethod] = useState("GET");
  const [authType, setAuthType] = useState("none");
  const [authToken, setAuthToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(
    "https://api.example.com/webhooks/user-registration/events"
  );
  const [path, setPath] = useState("/webhooks/user-registration/events");

  const httpMethods = [
    { value: "GET", label: "GET", enabled: true },
    { value: "POST", label: "POST", enabled: true },
    { value: "PUT", label: "PUT", enabled: false },
    { value: "PATCH", label: "PATCH", enabled: false },
    { value: "DELETE", label: "DELETE", enabled: false },
  ];

  const authTypes = [
    { value: "none", label: "None" },
    { value: "bearer", label: "Bearer Token" },
    { value: "api-key", label: "API Key" },
    { value: "basic", label: "Basic Auth" },
  ];

  const formatUrl = (url) => {
    if (url.length > 50) {
      const parts = url.match(/.{1,50}/g);
      return parts.map((part, index) => (
        <div key={index} className={index > 0 ? "pl-4" : ""}>
          {part}
        </div>
      ));
    }
    return url;
  };

  return (
    <DetailsModal setSelectedNode={setSelectedNode}>
      <WorkflowJSON data={null} type="input" />
      <ScrollArea
        className="w-full max-w-md mx-auto"
        // className="w-lg mx-auto p-6 bg-gray-50 h-5/6 rounded-lg bg-gradient-to-r from-orange-500 to-red-600"
        onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
      >
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* HTTP Method and URL Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge
                  variant={httpMethod === "GET" ? "default" : "secondary"}
                  className="font-mono text-xs px-3 py-1"
                >
                  {httpMethod}
                </Badge>
                <div className="flex-1 text-sm font-mono text-muted-foreground break-words">
                  {formatUrl(webhookUrl)}
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
                <SelectContent className="">
                  {httpMethods.map((method) => (
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

            {/* Path Section */}
            <div className="space-y-2">
              <Label htmlFor="path" className="text-sm font-medium">
                Path
              </Label>
              <Input
                id="path"
                value={path}
                disabled
                className="font-mono text-sm bg-muted"
                placeholder="/webhook/path"
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
                  {authTypes.map((type) => (
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
                <Label htmlFor="auth-token" className="text-sm font-medium">
                  Authentication Token
                </Label>
                <div className="relative">
                  <Input
                    id="auth-token"
                    type={showToken ? "text" : "password"}
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    placeholder="Paste your token here..."
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    {authToken && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => navigator.clipboard.writeText(authToken)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" size="sm">
                Save Configuration
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <TestTube className="h-3 w-3" />
                Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
      <WorkflowJSON data={null} type="output" />
    </DetailsModal>
  );
}
