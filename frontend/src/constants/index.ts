import { getCredential } from "@/service/node";
import { FormFieldType } from "@/types";
import {
  Calendar,
  FileText,
  Hash,
  Mail,
  Type,
  Key,
  Shield,
  User,
  Globe,
  KeyRound,
} from "lucide-react";

export const HttpMethods = [
  { value: "GET", label: "GET", enabled: true },
  { value: "POST", label: "POST", enabled: true },
  { value: "PUT", label: "PUT", enabled: true },
  { value: "PATCH", label: "PATCH", enabled: false },
  { value: "DELETE", label: "DELETE", enabled: false },
  { value: "HEAD", label: "HEAD", enabled: false },
  { value: "OPTIONS", label: "OPTIONS", enabled: false },
];

export const HeaderAuthTypes = [
  { value: "none", label: "None" },
  { value: "bearer", label: "Bearer Token" },
  { value: "api-key", label: "API Key" },
  { value: "custom", label: "Custom Token" },
  { value: "basic", label: "Basic Auth" },
];

export const headerAuthKeyValue = async (
  authType: string,
  credentialId?: string,
  token?: string,
  userId?: string,
  username?: string,
  password?: string
) => {
  let authToken = "";
  if (token && userId && credentialId) {
    //
    const credential = await getCredential(token, userId, credentialId);
    if (credential) {
      authToken = credential.custom_token;
    }
  }
  switch (authType) {
    case "bearer":
      return { Authorization: `Bearer ${authToken}` };
    case "custom":
      return { Authorization: `${authToken}` };
    case "api-key":
      return { "x-api-key": authToken };
    case "basic":
      const basicAuth = btoa(`${username}:${password}`);
      return { Authorization: `Basic ${basicAuth}` };
    default:
      break;
  }
};

export const conditionOperators = [
  { value: "equals", label: "equals", description: "is equal to" },
  { value: "not_equals", label: "not equals", description: "is not equal to" },
  { value: "contains", label: "contains", description: "contains" },
  {
    value: "not_contains",
    label: "not contains",
    description: "does not contain",
  },
  { value: "starts_with", label: "starts with", description: "starts with" },
  { value: "ends_with", label: "ends with", description: "ends with" },
  {
    value: "greater_than",
    label: "greater than",
    description: "is greater than",
  },
  { value: "less_than", label: "less than", description: "is less than" },
  {
    value: "greater_equal",
    label: "greater or equal",
    description: "is greater than or equal to",
  },
  {
    value: "less_equal",
    label: "less or equal",
    description: "is less than or equal to",
  },
  { value: "is_empty", label: "is empty", description: "is empty" },
  { value: "is_not_empty", label: "is not empty", description: "is not empty" },
  {
    value: "regex_match",
    label: "regex match",
    description: "matches regex pattern",
  },
];

export const logicalOperators = [
  { value: "and", label: "AND", description: "All conditions must be true" },
  {
    value: "or",
    label: "OR",
    description: "At least one condition must be true",
  },
];

export const fieldTypes: FormFieldType[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "email", label: "Email", icon: Mail },
  { type: "number", label: "Number", icon: Hash },
  { type: "textarea", label: "Text Area", icon: FileText },
  { type: "date", label: "Date", icon: Calendar },
];

export const CREDENTIAL_TYPES = {
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
  "custom-token": {
    label: "Custom Token",
    icon: KeyRound, // Or another fitting icon from your icon set
    description: "Authorization header with raw token (no prefix)",
    fields: ["customToken"],
  },
  "google-oauth": {
    label: "Google OAuth",
    icon: Globe,
    description: "Google OAuth 2.0 authentication",
    fields: [],
  },
};

export const openAIModels = [
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", enabled: true },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", enabled: true },
  { value: "gpt-4o", label: "GPT-4o", enabled: true },
  { value: "gpt-4", label: "GPT-4", enabled: false },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", enabled: false },
  { value: "dall-e-3", label: "DALL-E 3", enabled: false },
  { value: "whisper-1", label: "Whisper", enabled: false },
];

// Response Format Options
export const responseFormats = [
  { value: "text", label: "Text", disabled: true },
  { value: "json", label: "JSON" },
  { value: "structured", label: "Structured", disabled: true },
];
