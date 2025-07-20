"use client";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Key, Shield, User, Globe, RefreshCcw } from "lucide-react";
import { getAllCredential } from "@/service/node";
import { useAuth, useUser } from "@clerk/nextjs";
import CredentialCard from "./Card";
import CredentialComponent from ".";

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
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [credentials, setCredentials] = useState([]);

  const fetchCredentials = async () => {
    const token = await getToken();
    if (!token || !user?.id) return;
    const credentials = await getAllCredential(token, user.id);
    setCredentials(credentials);
  };
  useEffect(() => {
    if (isSignedIn) fetchCredentials();
  }, [isSignedIn]);

  return (
    <div className="p-6 max-w-4xl mx-auto relative z-50 bg-white rounded-lg shadow-xl m-6 h-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-600 flex gap-1.5 items-center">
              Credential Management{" "}
              <RefreshCcw
                className="text-blue-600 cursor-pointer"
                onClick={fetchCredentials}
              />
            </h1>
            <p className="text-muted-foreground">
              Manage your authentication credentials
            </p>
          </div>
          <CredentialComponent isOpen={isOpen} setIsOpen={setIsOpen} />
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
            credentials.map((credential) => (
              <CredentialCard
                key={credential.id}
                credential={credential}
                fetchCredentials={fetchCredentials}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
