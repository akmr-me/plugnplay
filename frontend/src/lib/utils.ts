import { Edge } from "@xyflow/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uuid() {
  return window.crypto.randomUUID();
}

export function findUpstreamNodes(currentNodeId: string, edges: Edge[]) {
  const visited = new Set();
  const upstreamNodes: string[] = [];

  // Build a reverse adjacency list: target → [source]
  const reverseGraph: Record<string, string[]> = {};
  edges.forEach(({ source, target }) => {
    if (!reverseGraph[target]) reverseGraph[target] = [];
    reverseGraph[target].push(source);
  });

  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const sources = reverseGraph[nodeId] || [];
    sources.forEach((src: string) => {
      upstreamNodes.push(src);
      dfs(src);
    });
  }

  dfs(currentNodeId);
  return upstreamNodes;
}

export function formURLFromQueryString(
  url = "https://jsonplaceholder.typicode.com/todos/1",
  queryParams: { key: string; value: string }[]
) {
  console.log("formURLFromQueryString", url);
  url = new URL(url);
  console.log("formURLFromQueryString2", url);

  url = url.origin + url.pathname;
  const urlWithQueryParams = new URL(url);
  urlWithQueryParams.search = "";

  queryParams.forEach(({ key, value }) => {
    if (key) urlWithQueryParams.searchParams.set(key, String(value));
  });
  return urlWithQueryParams.toString();
}
