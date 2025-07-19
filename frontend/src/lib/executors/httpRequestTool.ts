import { getInputOrOutPutData } from "@/components/nodes/details/WorkflowJSON";
import { Flow } from "@/types";
import { Node } from "@xyflow/react";
import { headerAuthKeyValue } from "@/constants";
import { WorkflowTemplateParser } from "../parser";
import { formURLFromQueryString } from "../utils";

interface HttpRequestState {
  bodyContent: Record<string, unknown>;
  queryParams: Record<string, unknown>[];
  headers: Record<string, unknown>[];
  includeHeaders: boolean;
  authType: string;
  authToken: string;
  url: string;
  httpMethod: string;
  includeQueryParams: boolean;
  credentialId?: string;
}

const parser = new WorkflowTemplateParser();

export default async function httpRequest(
  currentNode: Node,
  flow: Flow,
  updateNodeData: (
    id: string,
    data: Record<string, unknown>
  ) => Promise<unknown>,
  token?: string,
  userId?: string
): Promise<void> {
  //   form Input Object
  const input = getInputOrOutPutData(
    "input",
    flow.edges,
    currentNode,
    flow.nodes
  ) as Record<string, unknown>;

  const {
    bodyContent: initialBodyContent,
    queryParams: initialQueryParams,
    headers: initialHeaders,
    includeHeaders,
    authType,
    authToken,
    credentialId,
    url: initialUrl,
    httpMethod,
    includeQueryParams,
  } = currentNode.data.state as HttpRequestState;

  let bodyContent = initialBodyContent;
  let queryParams = initialQueryParams;
  let headers = initialHeaders;
  let url = initialUrl;
  console.log("+++++++++", queryParams, headers);
  bodyContent = parser.parseTemplates(bodyContent, input);
  queryParams = parser.parseTemplates(queryParams, input);
  headers = parser.parseTemplates(headers, input);

  try {
    const authTokenHeader = await headerAuthKeyValue(
      authType,
      credentialId,
      token,
      userId
    );

    // Build headers object
    const headersObject: Record<string, string> = {};

    if (includeHeaders) {
      headers.forEach((item) => {
        if (item.enabled && typeof item.key === "string") {
          headersObject[item.key] = String(item.value);
        }
      });

      if (authTokenHeader) {
        Object.assign(headersObject, authTokenHeader); // e.g., { Authorization: 'Bearer xyz' }
      }
    }
    url = includeQueryParams
      ? formURLFromQueryString(
          url,
          (queryParams as Record<string, unknown>[])
            .filter(
              (item) =>
                typeof item.key === "string" &&
                typeof item.value !== "undefined"
            )
            .map((item) => ({
              key: String(item.key),
              value: String(item.value),
            }))
        )
      : url;
    console.log({ url, queryParams, bodyContent, headers });
    const response = await fetch(url, {
      method: httpMethod,
      headers:
        Object.keys(headersObject).length > 0 ? headersObject : undefined,
      body:
        bodyContent && httpMethod !== "GET"
          ? JSON.stringify(bodyContent)
          : undefined,
    });

    const data = await response.json();
    console.log("Response:", data);
    updateNodeData(currentNode.id, { ...currentNode.data, output: data });
  } catch (error) {
    console.error("Request error:", error);
  }
}
