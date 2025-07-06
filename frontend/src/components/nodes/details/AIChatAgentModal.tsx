import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Bot, User, Settings } from "lucide-react";

// Mock components to match your structure
const DetailsModal = ({ children, setSelectedNode }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
      {children}
    </div>
  </div>
);

const WorkflowJSON = ({ data, type }) => (
  <div className="p-2 bg-gray-100 text-xs">
    {type === "input" ? "Input" : "Output"}: {JSON.stringify(data)}
  </div>
);

export default function ChatBoxModal() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! How can I help you today?",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isActive, setIsActive] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate agent response
    setTimeout(() => {
      const agentResponse = {
        id: messages.length + 2,
        text: "Thanks for your message! I'm here to help you with any questions.",
        sender: "agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentResponse]);
    }, 1000);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <DetailsModal setSelectedNode={setSelectedNode}>
      <WorkflowJSON data={null} type="input" />
      <ScrollArea
        className="w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                AI Chat Agent
              </CardTitle>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {isActive ? "Online" : "Offline"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Chat Messages Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversation</span>
                <Badge variant="outline" className="text-xs">
                  {messages.length} messages
                </Badge>
              </div>

              <div className="border rounded-lg bg-gray-50 h-64 flex flex-col">
                {/* Messages Container */}
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div className="flex items-start gap-2 max-w-[80%]">
                          {message.sender === "agent" && (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Bot className="h-3 w-3 text-blue-600" />
                            </div>
                          )}

                          <div
                            className={`px-3 py-2 rounded-lg text-sm ${
                              message.sender === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white text-gray-800 border rounded-bl-none shadow-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">
                              {message.text}
                            </p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender === "user"
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>

                          {message.sender === "user" && (
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <User className="h-3 w-3 text-gray-600" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t bg-white p-3 rounded-b-lg">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 text-sm"
                      disabled={!isActive}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || !isActive}
                      size="sm"
                      className="px-3"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Status Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Agent Status</span>
              </div>
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsActive(!isActive)}
              >
                {isActive ? "Online" : "Offline"}
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">
                  Response Time
                </div>
                <div className="text-lg font-semibold">~1s</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">
                  Satisfaction
                </div>
                <div className="text-lg font-semibold">98%</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" size="sm">
                Save Chat Log
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setMessages([
                    {
                      id: 1,
                      text: "Hi! How can I help you today?",
                      sender: "agent",
                      timestamp: new Date(),
                    },
                  ])
                }
              >
                Clear Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </ScrollArea>
      <WorkflowJSON data={null} type="output" />
    </DetailsModal>
  );
}
