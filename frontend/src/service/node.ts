import { ValidField } from "@/types";

// utils/wsClient.ts
export function connectToWebSocket(workflowId: string, token: string) {
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}ws/${workflowId}?token=${token}`;

  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log("✅ WebSocket connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("📨 Received from server:", data);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error", error);
  };

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");
  };

  return socket;
}

export const createFormTrigger = async (
  token: string,
  title: string,
  workflowId: string,
  //   fields: unknown[],
  description?: string
) => {
  if (!title) return;
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "form/" + workflowId;

  const response = await fetch(EndPoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description }),
  });
  console.log("create", response);
  return await response.json();
};

export const updateFormTrigger = async (
  token: string,
  workflowId: string,
  title?: string,
  description?: string
) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "form/" + workflowId;

  if (title && title.length < 3) return;

  const response = await fetch(EndPoint, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description }),
  });
  return await response.json();
};

export const createFormField = async (
  token: string,
  workflowId: string,
  type: ValidField,
  position: number,
  required: boolean
) => {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL + "form/" + workflowId + "/form_field";

  const response = await fetch(EndPoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type, position, required }),
  });
  console.log("create", response);
  return await response.json();
};

export const updateFormField = async (
  token: string,
  workflowId: string,
  formFieldId: string,
  updates: {
    label: string;
    placeholder: number;
    required: boolean;
    position: number;
  }
) => {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL +
    "form/" +
    workflowId +
    "/form_field/" +
    formFieldId;

  const response = await fetch(EndPoint, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  console.log("create", response);
  return await response.json();
};

export const deleteFormField = async (
  token: string,
  workflowId: string,
  formFieldId: string
) => {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL +
    "form/" +
    workflowId +
    "/form_field/" +
    formFieldId;

  const response = await fetch(EndPoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  console.log("create", response);
  return response.ok;
};

export const testSubmitForm = async (
  token: string,
  workflowId: string,
  data: Record<string, unknown>
) => {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL + "submit/form/" + workflowId;
  const response = await fetch(EndPoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

export const getSchedule = async (
  token: string,
  workflowId: string
  // scheduleType: string,
  // value: Date
) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "schedule/" + workflowId;
  const response = await fetch(EndPoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // body: JSON.stringify({ scheduleType, value }),
  });
  return await response.json();
};

export const createAndUpdateSchedule = async (
  token: string,
  workflowId: string,
  scheduleType: string,
  value: Date
) => {
  if (!scheduleType || !value) return;
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "schedule/" + workflowId;
  const response = await fetch(EndPoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ schedule_type: scheduleType, run_at: value }),
  });
  return await response.json();
};

export const deleteSchedule = async (token: string, workflowId: string) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "schedule/" + workflowId;
  const response = await fetch(EndPoint, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.status;
};

export const deleteForm = async (token: string, workflowId: string) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "form/" + workflowId;
  const response = await fetch(EndPoint, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.status;
};

export const getCredential = async (
  token: string,
  user_id: string,
  credentialId: string
) => {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL +
    "credential/" +
    user_id +
    "/" +
    credentialId;
  const response = await fetch(EndPoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};

export const getAllCredential = async (token: string, user_id: string) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "credential/" + user_id;
  const response = await fetch(EndPoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};

export const createAndUpdateCredential = async (
  token: string,
  user_id: string,
  credential: Record<string, string>
) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "credential/" + user_id;
  const response = await fetch(EndPoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(credential),
  });
  return await response.json();
};

export const deleteCredential = async (
  token: string,
  user_id: string,
  credentialId: string
) => {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL +
    "credential/" +
    user_id +
    "/" +
    credentialId;
  const response = await fetch(EndPoint, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.status;
};

export const getWebhook = async (token: string, workflowId: string) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "webhook/" + workflowId;
  const response = await fetch(EndPoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};

export const createWebhook = async (
  token: string,
  workflowId: string,
  webhook: Record<string, string>
) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "webhook/" + workflowId;
  const response = await fetch(EndPoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(webhook),
  });
  return await response.json();
};

export const updateWebhook = async (
  token: string,
  workflowId: string,
  webhook: Record<string, string>
) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "webhook/" + workflowId;

  const response = await fetch(EndPoint, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(webhook),
  });
  return await response.json();
};

export const deleteWebhook = async (token: string, workflowId: string) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "webhook/" + workflowId;
  const response = await fetch(EndPoint, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.status;
};

export const handleTestNode = async (workflowId, state) => {
  const EndPoint =
    process.env.NEXT_PUBLIC_API_URL + "excecutor/" + workflowId + "/test";
  const response = await fetch(EndPoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(state),
  });
  return await response.json();
};

export const executeWorkflow = async (token: string, workflowId: string) => {
  console.log({ token, workflowId });
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "excecutor/" + workflowId;
  const response = await fetch(EndPoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};

export const getWorkflow = async (token: string, workflowId: string) => {
  const EndPoint = process.env.NEXT_PUBLIC_API_URL + "workflow/" + workflowId;
  const response = await fetch(EndPoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};
