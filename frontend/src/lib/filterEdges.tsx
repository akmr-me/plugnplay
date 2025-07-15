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

  // Step 1: Create a Set of existing node IDs for O(1) average time complexity lookups.
  // This takes O(N_nodes) time.
  const existingNodeIds = new Set(workflowData.nodes.map((node) => node.id));

  const usedEdges = [];

  // Step 2: Iterate through each edge and check if its source and target nodes exist.
  // This takes O(N_edges) time.
  for (const edge of workflowData.edges) {
    const sourceNodeId = edge.source;
    const targetNodeId = edge.target;

    // An edge is considered "used" if both its source and target nodes exist.
    if (
      existingNodeIds.has(sourceNodeId) &&
      existingNodeIds.has(targetNodeId)
    ) {
      usedEdges.push(edge);
    } else {
      // Optional: Log which edges are being filtered out for debugging
      console.warn(
        `DEBUG: Edge ${
          edge.id || "N/A"
        } is unused. Source '${sourceNodeId}' or Target '${targetNodeId}' not found.`
      );
    }
  }

  // Step 3: Create a new workflow data object with only the used edges.
  // This ensures the original object is not mutated.
  const filteredWorkflow = { ...workflowData, edges: usedEdges };
  console.log({ filteredWorkflow });

  return filteredWorkflow;
}
