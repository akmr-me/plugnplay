import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Minimize2, Monitor, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type StreamDataItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  details: string;
  timestamp: number;
};

interface FloatingStreamCardProps {
  isConnected: boolean;
  streamData: StreamDataItem[];
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  resetStreamData: () => void;
}

const FloatingStreamCard: React.FC<FloatingStreamCardProps> = ({
  isConnected,
  streamData,
  isMinimized,
  setIsMinimized,
  resetStreamData,
}) => {
  const [selectedItem, setSelectedItem] = useState(null);

  const getTypeColor = (
    type: "tool" | "trigger" | "start" | "end" | "output"
  ) => {
    const colors = {
      tool: "bg-blue-500 hover:bg-blue-600",
      trigger: "bg-purple-500 hover:bg-purple-600",
      start: "bg-green-500 hover:bg-green-600",
      end: "bg-red-500 hover:bg-red-600",
      output: "bg-orange-500 hover:bg-orange-600",
    };
    return colors[type] || "bg-gray-500 hover:bg-gray-600";
  };

  interface FormatTime {
    (timestamp: number): string;
  }

  const formatTime: FormatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(label + " Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-12 h-12 shadow-lg"
          variant="default"
        >
          <Monitor className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card className="w-80 h-96 shadow-2xl border-2 gap-4">
        <CardHeader className="pb-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              Stream Monitor
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                title="Reset Stream Data"
                size="sm"
                onClick={resetStreamData}
                className="w-6 h-6 p-0"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="w-6 h-6 p-0"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {selectedItem ? (
            <div className="p-2 h-80">
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant="secondary"
                  className={`${getTypeColor(
                    selectedItem.type
                  )} text-white border-0`}
                >
                  {selectedItem.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                  className="w-6 h-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">
                      {selectedItem.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {formatTime(selectedItem.timestamp)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-xs mb-1">Description</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {selectedItem.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-xs mb-1">Details</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedItem.details}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea
              className="h-[295px] px-2"
              viewportClassName="h-[295px]"
            >
              <div className="space-y-1">
                {streamData.length === 0 ? (
                  <div className="text-center text-muted-foreground text-xs py-8">
                    No stream data available
                  </div>
                ) : (
                  streamData.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 justify-between">
                            <Badge
                              variant="secondary"
                              className={`${getTypeColor(
                                item.type
                              )} text-white text-xs px-1 py-0 border-0`}
                            >
                              {item.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(item.timestamp)}
                            </span>
                          </div>
                          {item.type === "output" ? (
                            <>
                              {" "}
                              <h3 className="font-medium text-xs mb-1 truncate">
                                {JSON.parse(item.details)?.fields?.[0].label}
                              </h3>
                              <span
                                className="text-xs text-muted-foreground flex items-center gap-1 justify-between"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* <span>{item.details?.fields?.[0]?.value}</span> */}
                                <span>
                                  {JSON.parse(item.details)?.fields?.[0].value}
                                </span>
                                <Copy
                                  size={14}
                                  onClick={() =>
                                    copyToClipboard(
                                      JSON.parse(item.details)?.fields?.[0]
                                        .value,
                                      JSON.parse(item.details)?.fields?.[0]
                                        .label
                                    )
                                  }
                                />
                              </span>
                            </>
                          ) : (
                            <>
                              <h3 className="font-medium text-xs mb-1 truncate">
                                {item.title}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingStreamCard;
