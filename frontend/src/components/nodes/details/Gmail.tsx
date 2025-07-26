"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Send, TestTube2, Plus, X } from "lucide-react";
import DetailsModal from "./Modal";
import WorkflowJSON from "./WorkflowJSON";
import AuthCredentials from "@/components/AuthCredentials";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/nextjs";
import httpRequest from "@/lib/executors/httpRequestTool";

const emailPriorities = [
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

const emailFormats = [
  { value: "html", label: "HTML" },
  { value: "plain", label: "Plain Text" },
];
type EmailType = "to" | "cc" | "bcc";
export default function GmailDetails({ setSelectedNode, node }) {
  const { data } = node;
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const { user } = useUser();

  // Email Configuration
  const [credentialId, setCredentialId] = useState(
    data?.state?.credentialId || ""
  );
  const [fromEmail, setFromEmail] = useState(data?.state?.fromEmail || "");
  const [fromName, setFromName] = useState(data?.state?.fromName || "");
  const [toEmails, setToEmails] = useState<string[]>(
    data?.state?.toEmails || [""]
  );
  const [ccEmails, setCcEmails] = useState<string[]>(
    data?.state?.ccEmails || []
  );
  const [bccEmails, setBccEmails] = useState<string[]>(
    data?.state?.bccEmails || []
  );
  const [subject, setSubject] = useState<string>(data?.state?.subject || "");
  const [body, setBody] = useState(data?.state?.body || "");
  const [priority, setPriority] = useState(data?.state?.priority || "normal");
  const [format, setFormat] = useState(data?.state?.format || "html");
  // const [attachments, setAttachments] = useState(
  //   data?.state?.attachments || []
  // );

  const [emailStatus, setEmailStatus] = useState("configured");
  const { updateNodeData, getNodes, getEdges } = useReactFlow();

  const addEmailField = (type: EmailType) => {
    switch (type) {
      case "to":
        setToEmails([...toEmails, ""]);
        break;
      case "cc":
        setCcEmails([...ccEmails, ""]);
        break;
      case "bcc":
        setBccEmails([...bccEmails, ""]);
        break;
    }
  };

  const removeEmailField = (type: EmailType, index: number) => {
    switch (type) {
      case "to":
        if (toEmails.length > 1) {
          setToEmails(toEmails.filter((_, i) => i !== index));
        }
        break;
      case "cc":
        setCcEmails(ccEmails.filter((_, i) => i !== index));
        break;
      case "bcc":
        setBccEmails(bccEmails.filter((_, i) => i !== index));
        break;
    }
  };

  const updateEmailField = (type: EmailType, index: number, value: string) => {
    switch (type) {
      case "to":
        setToEmails(
          toEmails.map((email: string, i: number) =>
            i === index ? value : email
          )
        );
        break;
      case "cc":
        setCcEmails(ccEmails.map((email, i) => (i === index ? value : email)));
        break;
      case "bcc":
        setBccEmails(
          bccEmails.map((email, i) => (i === index ? value : email))
        );
        break;
    }
  };

  const isEmailValid = () => {
    return (
      fromEmail && toEmails.some((email) => email.trim()) && subject && body
    );
  };
  const SendEmailURL =
    process.env.NEXT_PUBLIC_API_URL +
    `excecutor/${node.workflowId}/node/send_email`;
  const handleSaveConfiguration = () => {
    console.log("Saving configuration:", node.data);
    updateNodeData(node.id, {
      ...node.data,
      error: null,
      state: {
        credentialId,
        fromEmail,
        fromName,
        toEmails,
        ccEmails,
        bccEmails,
        subject,
        body,
        priority,
        format,
        // attachments,
        httpMethod: "POST",
        authType: "bearer",
        // showToken,
        includeBody: true,
        includeHeaders: true,
        includeQueryParams: false,
        url: SendEmailURL,
        bodyContent: {
          credentialId,
          fromEmail,
          fromName,
          toEmails,
          ccEmails,
          bccEmails,
          subject,
          body,
          priority,
          format,
        },
        headers: [
          {
            enabled: true,
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    });
    toast.success("Configuration saved successfully!");
  };
  console.log({ SendEmailURL });
  const handleSendTestEmail = async () => {
    const token = await getToken();
    if (!token) {
      toast.error("You need to be logged in to test the request.");
      return;
    }
    if (!fromEmail) return;
    setLoading(true);
    try {
      const currentNode = {
        ...node,
        data: {
          ...node.data,
          state: {
            credentialId,
            fromEmail,
            fromName,
            toEmails,
            ccEmails,
            bccEmails,
            subject,
            body,
            priority,
            format,
            // attachments,
            httpMethod: "POST",
            authType: "bearer",
            // showToken,
            includeBody: true,
            includeHeaders: true,
            includeQueryParams: false,
            url: SendEmailURL,
            bodyContent: {
              credentialId,
              fromEmail,
              fromName,
              toEmails,
              ccEmails,
              bccEmails,
              subject,
              body,
              priority,
              format,
            },
            headers: [
              {
                enabled: true,
                key: "Content-Type",
                value: "application/json",
              },
            ],
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
      toast.success("Email sent successfully!");
    } catch (error) {
      console.error("Request error:", error, { node });
      toast.error("Failed to send Email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DetailsModal setSelectedNode={setSelectedNode}>
      <WorkflowJSON node={node} type="input" />
      <Card className="w-full">
        <ScrollArea
          className="w-full max-w-lg mx-auto max-h-[600px]! height-[600px]"
          viewportClassName="max-h-[600px]"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Resend Configuration
              </CardTitle>
              <Badge
                variant={emailStatus === "configured" ? "default" : "secondary"}
                className="text-xs"
              >
                {emailStatus === "configured" ? "Configured" : "Not Configured"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <AuthCredentials
                  authToken={credentialId}
                  setAuthToken={setCredentialId}
                />
              </div>
            </div>
            <div className="space-y-4">
              {/* From Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">From</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="sender@gmail.com"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Sender Name (optional)"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                  />
                </div>
              </div>

              {/* To Emails */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">To</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addEmailField("to")}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
                {toEmails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="recipient@example.com"
                      value={email}
                      onChange={(e) =>
                        updateEmailField("to", index, e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmailField("to", index)}
                      disabled={toEmails.length === 1}
                      className="p-1 h-8 w-8"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* CC Emails */}
              {ccEmails.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">CC</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addEmailField("cc")}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                  {ccEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="cc@example.com"
                        value={email}
                        onChange={(e) =>
                          updateEmailField("cc", index, e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmailField("cc", index)}
                        className="p-1 h-8 w-8"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add CC/BCC Buttons */}
              <div className="flex gap-2">
                {ccEmails.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addEmailField("cc")}
                  >
                    Add CC
                  </Button>
                )}
                {bccEmails.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addEmailField("bcc")}
                  >
                    Add BCC
                  </Button>
                )}
              </div>

              {/* BCC Emails */}
              {bccEmails.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">BCC</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addEmailField("bcc")}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                  {bccEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="bcc@example.com"
                        value={email}
                        onChange={(e) =>
                          updateEmailField("bcc", index, e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmailField("bcc", index)}
                        className="p-1 h-8 w-8"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Email Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emailPriorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="format" className="text-sm font-medium">
                    Format
                  </Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emailFormats.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label htmlFor="body" className="text-sm font-medium">
                  Email Body
                </Label>
                <Textarea
                  id="body"
                  placeholder="Enter your email content here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="w-full"
                />
              </div>

              {/* Email Preview */}
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email Preview</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    <strong>From:</strong> {fromEmail || "[sender email]"}
                  </div>
                  <div>
                    <strong>To:</strong>{" "}
                    {toEmails.filter((e) => e.trim()).join(", ") ||
                      "[recipients]"}
                  </div>
                  <div>
                    <strong>Subject:</strong> {subject || "[subject]"}
                  </div>
                  <div>
                    <strong>Body:</strong>{" "}
                    {body ? body.substring(0, 100) + "..." : "[email body]"}
                  </div>
                </div>
              </div>
            </div>

            {/* Email Status Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                <span className="text-sm font-medium">Email Status</span>
              </div>
              <Button
                variant={emailStatus === "configured" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setEmailStatus(
                    emailStatus === "configured" ? "disabled" : "configured"
                  )
                }
              >
                {emailStatus === "configured" ? "Enabled" : "Disabled"}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                size="sm"
                disabled={!isEmailValid() || loading}
                onClick={handleSaveConfiguration}
              >
                Save Configuration
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                disabled={!isEmailValid() || loading}
                onClick={handleSendTestEmail}
                loading={loading}
              >
                <TestTube2 className="h-3 w-3" />
                Test Email
              </Button>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
      <WorkflowJSON node={node} type="output" />
    </DetailsModal>
  );
}
