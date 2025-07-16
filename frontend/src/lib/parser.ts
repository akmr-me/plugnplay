// Template string parser for workflow variable resolution
class WorkflowTemplateParser {
  private templateRegex: RegExp;

  constructor() {
    // Regex to match template variables like {{$node.data.field}}
    this.templateRegex = /"?\{\{\s*\$([^}]+?)\s*\}\}"?/g;
  }

  parseTemplates<T>(value: T, context: Record<string, unknown>): T {
    if (typeof value === "string") {
      return this.parseStringTemplates(value, context);
    } else if (Array.isArray(value)) {
      return value.map((item) => this.parseTemplates(item, context)) as T;
    } else if (typeof value === "object" && value !== null) {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.parseTemplates(val, context);
      }
      return result as T;
    }
    return value;
  }

  /**
   * Parse template variables in a string
   * @param {string} str - String containing template variables
   * @param {Object} context - Available data context
   * @returns {string} - String with variables resolved
   */
  parseStringTemplates(str: string, context: Record<string, unknown>) {
    return str.replace(this.templateRegex, (match, expression) => {
      try {
        const value = this.resolveExpression(expression, context);
        return value !== undefined ? String(value) : match;
      } catch (error) {
        console.warn(`Failed to resolve template: ${match}`, error);
        return match; // Return original if can't resolve
      }
    });
  }

  /**
   * Resolve a dot notation expression like "node1.data.user.name"
   * @param {string} expression - Dot notation expression
   * @param {Object} context - Available data context
   * @returns {any} - Resolved value
   */
  resolveExpression(expression: string, context: unknown) {
    const parts = expression.split(".");
    let current = context;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }

      // Handle array indices like data[0] or data['key']
      if (part.includes("[") && part.includes("]")) {
        const [prop, indexPart] = part.split("[");
        const index = indexPart.replace("]", "").replace(/['"]/g, "");

        if (prop) {
          current = current[prop];
        }

        if (
          current &&
          (Array.isArray(current) || typeof current === "object")
        ) {
          current = current[index];
        }
      } else {
        current = current[part];
      }
    }

    return current;
  }

  /**
   * Check if a string contains template variables
   * @param {string} str - String to check
   * @returns {boolean} - True if contains templates
   */
  hasTemplates(str: string) {
    return typeof str === "string" && this.templateRegex.test(str);
  }

  /**
   * Extract all template variables from a string
   * @param {string} str - String to analyze
   * @returns {Array} - Array of template expressions
   */
  extractTemplates(str) {
    const matches = [];
    let match;
    this.templateRegex.lastIndex = 0; // Reset regex

    while ((match = this.templateRegex.exec(str)) !== null) {
      matches.push({
        full: match[0],
        expression: match[1],
        index: match.index,
      });
    }

    return matches;
  }
}

// Workflow execution context manager
// class WorkflowContext {
//   nodeOutputs: Map<string, unknown>;
//   parser: WorkflowTemplateParser;

//   constructor() {
//     this.nodeOutputs = new Map();
//     this.parser = new WorkflowTemplateParser();
//   }

//   /**
//    * Set output data for a node
//    * @param {string} nodeId - Node identifier
//    * @param {any} data - Node output data
//    */
//   setNodeOutput(nodeId: string, data) {
//     this.nodeOutputs.set(nodeId, data);
//   }

//   /**
//    * Get the full context for template resolution
//    * @returns {Object} - Complete context object
//    */
//   getContext() {
//     const context = {};

//     // Add all node outputs to context
//     for (const [nodeId, output] of this.nodeOutputs) {
//       context[nodeId] = output;
//     }

//     // Add special variables
//     context.$now = new Date().toISOString();
//     context.$timestamp = Date.now();

//     return context;
//   }

//   /**
//    * Resolve templates in any value using current context
//    * @param {any} value - Value to resolve
//    * @returns {any} - Resolved value
//    */
//   resolveValue(value) {
//     const context = this.getContext();
//     return this.parser.parseTemplates(value, context);
//   }

//   /**
//    * Check if node dependencies are met
//    * @param {Array} dependencies - Array of node IDs this node depends on
//    * @returns {boolean} - True if all dependencies are available
//    */
//   checkDependencies(dependencies) {
//     return dependencies.every((nodeId) => this.nodeOutputs.has(nodeId));
//   }
// }

// Example usage and testing
// class WorkflowEngine {
//   constructor() {
//     this.context = new WorkflowContext();
//   }

//   async executeNode(node) {
//     // Check if all input dependencies are available
//     if (node.inputs && !this.context.checkDependencies(node.inputs)) {
//       throw new Error(`Missing dependencies for node ${node.id}`);
//     }

//     // Resolve templates in node configuration
//     const resolvedConfig = this.context.resolveValue(node.config);

//     console.log(`Executing node ${node.id} with config:`, resolvedConfig);

//     // Simulate node execution
//     let output;
//     switch (node.type) {
//       case "http":
//         output = await this.executeHttpNode(resolvedConfig);
//         break;
//       case "transform":
//         output = this.executeTransformNode(resolvedConfig);
//         break;
//       case "condition":
//         output = this.executeConditionNode(resolvedConfig);
//         break;
//       default:
//         output = { message: `Executed ${node.type} node` };
//     }

//     // Store output for future nodes
//     this.context.setNodeOutput(node.id, output);

//     return output;
//   }

//   async executeHttpNode(config) {
//     // Simulate HTTP request
//     return {
//       status: 200,
//       data: {
//         user: { name: "John Doe", email: "john@example.com" },
//         timestamp: new Date().toISOString(),
//       },
//     };
//   }

//   executeTransformNode(config) {
//     return {
//       message: config.message || "Transformed data",
//       processedAt: new Date().toISOString(),
//     };
//   }

//   executeConditionNode(config) {
//     return {
//       condition: config.condition,
//       result: Math.random() > 0.5,
//       evaluated: true,
//     };
//   }
// }

// // Example workflow with template variables
// const exampleWorkflow = {
//   nodes: [
//     {
//       id: "webhook",
//       type: "trigger",
//       config: {
//         url: "https://api.example.com/webhook",
//       },
//     },
//     {
//       id: "fetchUser",
//       type: "http",
//       inputs: ["webhook"],
//       config: {
//         url: "https://api.example.com/users/{{$webhook.data.userId}}",
//         method: "GET",
//         headers: {
//           Authorization: "Bearer {{$webhook.data.token}}",
//         },
//       },
//     },
//     {
//       id: "processUser",
//       type: "transform",
//       inputs: ["fetchUser"],
//       config: {
//         message:
//           "Processing user: {{$fetchUser.data.user.name}} ({{$fetchUser.data.user.email}})",
//         timestamp: "{{$now}}",
//       },
//     },
//     {
//       id: "checkCondition",
//       type: "condition",
//       inputs: ["processUser"],
//       config: {
//         condition: "{{$fetchUser.data.user.name}} !== null",
//         field: "{{$fetchUser.data.user.name}}",
//       },
//     },
//   ],
// };

// // Demo execution
// async function demo() {
//   const engine = new WorkflowEngine();

//   // Simulate webhook trigger with initial data
//   engine.context.setNodeOutput("webhook", {
//     data: {
//       userId: "123",
//       token: "abc123",
//       timestamp: new Date().toISOString(),
//     },
//   });

//   console.log("=== Workflow Execution Demo ===\n");

//   // Execute workflow nodes in sequence
//   for (const node of exampleWorkflow.nodes.slice(1)) {
//     // Skip trigger
//     console.log(`\n--- Executing Node: ${node.id} ---`);

//     try {
//       const result = await engine.executeNode(node);
//       console.log("Output:", result);
//     } catch (error) {
//       console.error("Error:", error.message);
//     }
//   }

//   // Show final context
//   console.log("\n=== Final Context ===");
//   console.log(JSON.stringify(engine.context.getContext(), null, 2));
// }

// // Run demo
// demo().catch(console.error);

// Export for use in other modules
export { WorkflowTemplateParser };
// export { WorkflowTemplateParser, WorkflowContext, WorkflowEngine };
