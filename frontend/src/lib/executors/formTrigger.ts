import { Flow } from "@/types";
import { Node } from "@xyflow/react";
import { FormEvent } from "react";

export default async function formTriggerExecutor(
  e: FormEvent<EventTarget>,
  currentNode: Node,
  flow: Flow,
  updateNodeData: (id: string, data: Record<string, unknown>) => unknown
): Promise<void> {
  e.preventDefault(); // prevent default form submission

  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);

  const data = Object.fromEntries(formData.entries()); // convert to plain object

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();

    console.log("Success:", result);
    updateNodeData(currentNode.id, { ...currentNode.data, output: result });
    // Handle success (redirect, show message, etc.)
  } catch (error) {
    console.error("Error:", error);
    // Handle error
  }
}
