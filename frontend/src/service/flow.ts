import { Project } from "@/types";
import { Edge, Node, Viewport } from "@xyflow/react";

export async function createNewProject(
  token: string,
  projectName: string,
  user_id: string
): Promise<Project> {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + user_id + "/project";
  const response = await fetch(EndPoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: projectName,
      description: "This is a new project.",
    }),
  });
  return await response.json();
}

export async function fetchAllProjects(
  token: string,
  user_id: string
): Promise<Project> {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + user_id + "/project";
  const response = await fetch(EndPoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}

export async function deleteProjectById(
  token: string,
  user_id: string,
  projectId: string
) {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL + user_id + "/project/" + projectId;

  const response = await fetch(EndPoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}

export async function createNewWorkflow(
  token: string,
  flowname: string,
  user_id: string,
  project_id: string
) {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL +
    user_id +
    "/project/" +
    project_id +
    "/workflow";
  const response = await fetch(EndPoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: flowname,
      description: "This is a new workflow.",
    }),
  });
  return await response.json();
}

export async function getAllFlowsInProject(
  token: string,
  user_id: string,
  projectId: string
) {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL + user_id + "/project/" + projectId;

  const response = await fetch(EndPoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}

export async function deleteFlowByProjectAndFlowId(
  token: string,
  user_id: string,
  flowId: string,
  projectId: string
) {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL +
    user_id +
    "/project/" +
    projectId +
    "/workflow/" +
    flowId;

  const response = await fetch(EndPoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}

export async function getFlowDetailsByProjectAndFlowId(
  token: string,
  user_id: string,
  flowId: string,
  projectId: string
) {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL +
    user_id +
    "/project/" +
    projectId +
    "/workflow/" +
    flowId;

  const response = await fetch(EndPoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}

export async function updateWorkFlow(
  token: string,
  user_id: string,
  projectId: string,
  flowId: string,
  data: { viewport: Viewport; nodes: Node[]; edges: Edge[] }
) {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL +
    user_id +
    "/project/" +
    projectId +
    "/workflow/" +
    flowId;

  const response = await fetch(EndPoint, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}
