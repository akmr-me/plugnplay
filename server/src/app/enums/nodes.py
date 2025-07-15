from enum import Enum


class NodeType(Enum):
    NewFlow = ("new-flow",)
    ManualTrigger = ("manual-trigger",)
    ScheduleTrigger = ("schedule-trigger",)
    WebhookTrigger = ("webhook-trigger",)
    FormTrigger = ("form-trigger",)
    OpenAITools = ("open-ai-tool",)
    GeminiAITools = ("gemini-ai-tool",)
    MemoryAITools = ("memory-ai-tool",)
    ToolsAITools = ("tools-ai-tool",)
    HttpProgrammingTools = ("http-programming-tool",)
    JavaScriptProgrammingTools = ("javascript-programming-tool",)
    WebhookProgrammingTools = ("webhook-programming-tool",)
    MailOtherTools = ("mail-other-tool",)
    NotionOtherTools = ("notion-other-tool",)
    SleepOtherTools = ("sleep-other-tool",)
    ConditionalOtherTools = ("conditional-other-tool",)
