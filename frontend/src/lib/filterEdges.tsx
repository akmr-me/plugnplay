export function filterUnusedEdges(workflowData) {
  // Input validation
  if (
    !workflowData ||
    !Array.isArray(workflowData.nodes) ||
    !Array.isArray(workflowData.edges)
  ) {
    console.warn(
      "Invalid workflowData format. Expected an object with 'nodes' and 'edges' arrays."
    );
    return { ...workflowData }; // Return a shallow copy to be safe, or throw an error
  }

  const existingNodeIds = new Set(workflowData.nodes.map((node) => node.id));

  const usedEdges = [];

  for (const edge of workflowData.edges) {
    const sourceNodeId = edge.source;
    const targetNodeId = edge.target;

    if (
      existingNodeIds.has(sourceNodeId) &&
      existingNodeIds.has(targetNodeId)
    ) {
      usedEdges.push(edge);
    } else {
      console.warn(
        `DEBUG: Edge ${
          edge.id || "N/A"
        } is unused. Source '${sourceNodeId}' or Target '${targetNodeId}' not found.`
      );
    }
  }

  const filteredWorkflow = { ...workflowData, edges: usedEdges };

  return filteredWorkflow;
}
