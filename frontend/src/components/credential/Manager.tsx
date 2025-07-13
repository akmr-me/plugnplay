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
import { Eye, EyeOff, Key, Shield, User, Globe } from "lucide-react";

const CREDENTIAL_TYPES = {
  "bearer-token": {
    label: "Bearer Token",
    icon: Shield,
    description: "Authorization header with bearer token",
    fields: ["token"],
  },
  "api-key": {
    label: "API Key",
    icon: Key,
    description: "API key for service authentication",
    fields: ["apiKey"],
  },
  "basic-auth": {
    label: "Basic Authentication",
    icon: User,
    description: "Username and password authentication",
    fields: ["username", "password"],
  },
  "google-oauth": {
    label: "Google OAuth",
    icon: Globe,
    description: "Google OAuth 2.0 authentication",
    fields: [],
  },
};

export default function CredentialManager() {
  const [isOpen, setIsOpen] = useState(false);
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

    // Simulate Google OAuth flow
    // In real implementation, you would integrate with Google OAuth API
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

  const handleSubmit = () => {
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

    // Create credential object
    const newCredential = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      createdAt: new Date().toISOString(),
      ...getCredentialData(),
    };

    setCredentials((prev) => [...prev, newCredential]);
    resetForm();
    setIsOpen(false);
    alert("Credential saved successfully!");
  };

  const getCredentialData = () => {
    switch (formData.type) {
      case "bearer-token":
        return { token: formData.token };
      case "api-key":
        return { apiKey: formData.apiKey };
      case "basic-auth":
        return { username: formData.username, password: formData.password };
      case "google-oauth":
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
    <div className="p-6 max-w-4xl mx-auto relative z-50 bg-white rounded-lg shadow-xl m-4">
      {/* Main Interface */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Credential Management</h1>
            <p className="text-muted-foreground">
              Manage your authentication credentials
            </p>
          </div>
          <Button onClick={() => setIsOpen(true)}>Add Credential</Button>
        </div>

        {/* Credentials List */}
        <div className="space-y-4">
          {credentials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No credentials configured yet</p>
              <p className="text-sm">Click "Add Credential" to get started</p>
            </div>
          ) : (
            credentials.map((credential) => {
              const IconComponent = CREDENTIAL_TYPES[credential.type]?.icon;
              return (
                <div
                  key={credential.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {IconComponent && <IconComponent className="w-5 h-5" />}
                      <div>
                        <h3 className="font-medium">{credential.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {CREDENTIAL_TYPES[credential.type]?.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(credential.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {credential.description && (
                    <p className="text-sm text-muted-foreground">
                      {credential.description}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Credential Modal */}
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
    </div>
  );
}
