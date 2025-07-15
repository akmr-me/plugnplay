from langgraph.graph import StateGraph, END, START
from uuid import UUID
from typing import Callable, Dict, List, Any
import datetime
import inspect
import asyncio
from typing import TypedDict, Any

from enum import Enum
from app.services.workflow_template_parser import WorkflowTemplateParser
from app.services.openai_agent import structure_invocation


def with_node_id(func, node_id):
    if inspect.iscoroutinefunction(func):

        async def async_wrapper(state):
            return await func(state, node_id=node_id)

        return async_wrapper
    else:

        def sync_wrapper(state):
            return func(state, node_id=node_id)

        return sync_wrapper


class NodeType(Enum):
    NEW_FLOW = "new-flow"
    MANUAL_TRIGGER = "manual-trigger"
    SCHEDULE_TRIGGER = "schedule-trigger"
    WEBHOOK_TRIGGER = "webhook-trigger"
    FORM_TRIGGER = "form-trigger"
    OPEN_AI_TOOLS = "open-ai-tool"
    GEMINI_AI_TOOLS = "gemini-ai-tool"
    MEMORY_AI_TOOLS = "memory-ai-tool"
    TOOLS_AI_TOOLS = "tools-ai-tool"
    HTTP_PROGRAMMING_TOOLS = "http-programming-tool"
    JAVASCRIPT_PROGRAMMING_TOOLS = "javascript-programming-tool"
    WEBHOOK_PROGRAMMING_TOOLS = "webhook-programming-tool"
    MAIL_OTHER_TOOLS = "mail-other-tool"
    NOTION_OTHER_TOOLS = "notion-other-tool"
    SLEEP_OTHER_TOOLS = "sleep-other-tool"
    CONDITIONAL_OTHER_TOOLS = "conditional-other-tool"


class WorkflowState(TypedDict, total=False):
    input: dict
    state: dict
    output: dict


# === Example Node Logic Functions ===
async def form_trigger_node(state: dict, node_id: str) -> dict:
    # print("Running Form Trigger Node")
    state["form_trigger"] = "Triggered with data: " + str(state.get("input", {}))
    # print("state from form trigger", state)
    return state


async def open_ai_tool_node(state: dict, node_id: str) -> dict:
    # Datat to decrypt
    parser = WorkflowTemplateParser()
    template = state["state"]["nodes"][node_id]["data"]["state"]
    # print("-------------template-------------------")
    # print(template)
    # print("---------------context-----------------")
    # print("state nput", state["input"])
    # print("--------------------------------")
    parsed_data = parser.parse_templates(template, state["input"])
    # print()
    # print()
    # print("parsed+", parsed_data)
    # print()
    # print()
    response = await structure_invocation(parsed_data)
    # Get credential
    print("Running OpenAI Tool Node")
    state["open_ai_tool"] = "Generated result from: " + str(
        state.get("form_trigger", "")
    )
    state["input"]["open-ai-tool"] = response
    # print("********************************")
    # print(state["input"]["open-ai-tool"])
    # print("********************************")
    return state


# === Node Function Map ===
NODE_FUNCTION_MAP: Dict[NodeType, Callable[[dict], dict]] = {
    NodeType.FORM_TRIGGER: form_trigger_node,
    NodeType.OPEN_AI_TOOLS: open_ai_tool_node,
    # Add more mappings as you implement new node types
}


# === Main Graph Builder Class ===
class WorkflowGraphBuilder:
    def __init__(self, workflow: Any):
        self.workflow = workflow
        self.node_function_map = NODE_FUNCTION_MAP
        self.graph = StateGraph(WorkflowState)

    def build_graph(self):
        node_ids = {node["id"]: node for node in self.workflow["nodes"]}
        edges = self.workflow["edges"]

        # 1. Add all nodes
        for node_id, node_data in node_ids.items():
            node_type = node_data["type"]
            print("node type", node_type)
            func = self.node_function_map.get(NodeType(node_type))
            if not func:
                raise ValueError(f"No function defined for node type: {node_type}")
                # if "trigger" in node_type:
                #     self.graph.add_node(START, node_id)
                # else:
            wrapped_func = with_node_id(func, node_id)
            self.graph.add_node(node_id, wrapped_func)

        # 2. Wire the edges
        for edge in edges:
            source = edge["source"]
            target = edge["target"]
            self.graph.add_edge(source, target)

        # 3. Find start node(s) (no incoming edges)
        all_sources = set(edge["source"] for edge in edges)
        all_targets = set(edge["target"] for edge in edges)
        start_nodes = list(all_sources - all_targets)

        if not start_nodes:
            raise ValueError("No start node found.")

        # Use first start node as entry point
        self.graph.set_entry_point(start_nodes[0])

        # 4. Set end node(s)
        end_nodes = list(all_targets - all_sources)
        for node_id in end_nodes:
            self.graph.add_edge(node_id, END)

        return self.graph.compile()


# === Usage ===
# Assuming `workflow` is your parsed data object of class Workflow

# graph_builder = WorkflowGraphBuilder(workflow)
# compiled_graph = graph_builder.build_graph()

# Run it
# result = compiled_graph.invoke({"input": {}})
# print(result)
