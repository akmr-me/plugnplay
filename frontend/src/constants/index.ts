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
  { value: "basic", label: "Basic Auth" },
];

export const headerAuthKeyValue = (
  authType: string,
  token?: string,
  username?: string,
  password?: string
) => {
  switch (authType) {
    case "bearer":
      return { Authorization: `Bearer ${token}` };
    case "api-key":
      return { "x-api-key": token };
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
