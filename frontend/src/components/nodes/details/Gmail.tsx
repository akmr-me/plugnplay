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
import { Mail, Key, Send, TestTube2, Eye, EyeOff, Plus, X } from "lucide-react";
import DetailsModal from "./Modal";
import WorkflowJSON from "./WorkflowJSON";
import GoogleOAuth from "./GoogleOAuth";

const emailPriorities = [
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

const emailFormats = [
  { value: "html", label: "HTML" },
  { value: "plain", label: "Plain Text" },
];

export default function GmailDetails({ setSelectedNode, node }) {
  // OAuth Credentials
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showRefreshToken, setShowRefreshToken] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);

  // Email Configuration
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [toEmails, setToEmails] = useState([""]);
  const [ccEmails, setCcEmails] = useState([]);
  const [bccEmails, setBccEmails] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [format, setFormat] = useState("html");
  const [attachments, setAttachments] = useState([]);

  const [emailStatus, setEmailStatus] = useState("configured");
  const [activeTab, setActiveTab] = useState("credentials");

  const addEmailField = (type) => {
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

  const removeEmailField = (type, index) => {
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

  const updateEmailField = (type, index, value) => {
    switch (type) {
      case "to":
        setToEmails(toEmails.map((email, i) => (i === index ? value : email)));
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

  const isCredentialsValid = () => {
    return clientId && clientSecret && (refreshToken || accessToken);
  };

  const isEmailValid = () => {
    return (
      fromEmail && toEmails.some((email) => email.trim()) && subject && body
    );
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
                Gmail Configuration
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
            {/* Tab Navigation */}
            <div className="flex space-x-2 border-b">
              <Button
                variant={activeTab === "credentials" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("credentials")}
                className="flex items-center gap-1"
              >
                <Key className="h-3 w-3" />
                Credentials
              </Button>
              <Button
                variant={activeTab === "email" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("email")}
                className="flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                Email Setup
              </Button>
            </div>

            {/* Credentials Tab */}
            {activeTab === "credentials" && <GoogleOAuth />}

            {/* Email Tab */}
            {activeTab === "email" && (
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
            )}

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
                disabled={!isCredentialsValid() || !isEmailValid()}
              >
                Save Configuration
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                disabled={!isCredentialsValid() || !isEmailValid()}
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
