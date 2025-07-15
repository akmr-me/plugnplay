"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Globe } from "lucide-react";
import { CREDENTIAL_TYPES } from "@/constants";
import { createAndUpdateCredential } from "@/service/node";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/clerk-react";

export default function CredentialComponent({ isOpen, setIsOpen }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [credentials, setCredentials] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    token: "",
    apiKey: "",
    username: "",
    password: "",
    googleAuth: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleAuthenticating, setIsGoogleAuthenticating] = useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "",
      token: "",
      apiKey: "",
      username: "",
      password: "",
      googleAuth: null,
    });
  };

  const handleGoogleAuth = async () => {
    setIsGoogleAuthenticating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      // Mock successful auth response
      const mockGoogleAuth = {
        accessToken: "mock-access-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now(),
        email: "user@example.com",
        expiresIn: 3600,
      };

      setFormData((prev) => ({
        ...prev,
        googleAuth: mockGoogleAuth,
      }));
    } catch (error) {
      console.error("Google auth failed:", error);
      alert("Google authentication failed. Please try again.");
    } finally {
      setIsGoogleAuthenticating(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      alert("Please fill in required fields");
      return;
    }

    // Validate based on credential type
    const credentialType = CREDENTIAL_TYPES[formData.type];
    if (credentialType.fields.length > 0) {
      const hasRequiredFields = credentialType.fields.every(
        (field) => formData[field] && formData[field].trim() !== ""
      );

      if (!hasRequiredFields && formData.type !== "google-oauth") {
        alert("Please fill in all required credential fields");
        return;
      }
    }

    if (formData.type === "google-oauth" && !formData.googleAuth) {
      alert("Please authenticate with Google first");
      return;
    }
    const token = await getToken();
    if (!token) return;
    console.log("credential form data", formData);
    // Create credential object
    const newCredential = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      ...getCredentialData(),
    };
    const res = await createAndUpdateCredential(token, user.id, newCredential);
    console.log(res);

    setCredentials((prev) => [...prev, newCredential]);
    resetForm();
    setIsOpen(false);
    alert("Credential saved successfully!");
  };

  const getCredentialData = () => {
    switch (formData.type) {
      case "bearer-token":
        return { bearer_token: formData.token };
      case "api-key":
        return { api_key_value: formData.apiKey, api_key_name: "x-api-key" };
      case "basic-auth":
        return {
          basic_username: formData.username,
          basic_password: formData.password,
        };
      case "google-oauth":
        const test = {
          oauth_client_id: "test",
          oauth_client_secret: "test",
          oauth_refresh_token: "test",
          oauth_scopes: "test",
        };
        return { googleAuth: formData.googleAuth };
      default:
        return {};
    }
  };

  const renderCredentialFields = () => {
    const IconComponent = CREDENTIAL_TYPES[formData.type]?.icon;

    switch (formData.type) {
      case "bearer-token":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {IconComponent && <IconComponent className="w-4 h-4" />}
              {CREDENTIAL_TYPES[formData.type].description}
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Bearer Token *</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showPassword ? "text" : "password"}
                  value={formData.token}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, token: e.target.value }))
                  }
                  placeholder="Enter your bearer token"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case "api-key":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {IconComponent && <IconComponent className="w-4 h-4" />}
              {CREDENTIAL_TYPES[formData.type].description}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showPassword ? "text" : "password"}
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                  placeholder="Enter your API key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case "basic-auth":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {IconComponent && <IconComponent className="w-4 h-4" />}
              {CREDENTIAL_TYPES[formData.type].description}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "google-oauth":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {IconComponent && <IconComponent className="w-4 h-4" />}
              {CREDENTIAL_TYPES[formData.type].description}
            </div>
            <div className="space-y-4">
              {!formData.googleAuth ? (
                <Button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isGoogleAuthenticating}
                  className="w-full"
                  variant="outline"
                >
                  {isGoogleAuthenticating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      Authenticating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Sign in with Google
                    </div>
                  )}
                </Button>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">
                      Google Authentication Successful
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Authenticated as: {formData.googleAuth.email}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, googleAuth: null }))
                    }
                    className="mt-2 text-green-800 hover:text-green-900"
                  >
                    Re-authenticate
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Credential</DialogTitle>
          <DialogDescription>
            Configure a new authentication credential for your services
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter credential name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of this credential"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Credential Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select credential type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CREDENTIAL_TYPES).map(([key, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic Credential Fields */}
          {formData.type && renderCredentialFields()}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Save Credential
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
