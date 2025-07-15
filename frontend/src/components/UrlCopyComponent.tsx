"use client";
import React, { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

const UrlCopyComponent = ({
  url = "https://example.com/api/endpoint",
  showExternalLink = true,
  variant = "default",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator === "undefined") return "unknown";
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleExternalClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex-1 min-w-0">
          <code className="text-sm font-mono text-gray-800 break-all">
            {url}
          </code>
        </div>

        <div className="flex items-center space-x-1">
          {showExternalLink && (
            <button
              onClick={handleExternalClick}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={16} />
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
            title={copied ? "Copied!" : "Copy URL"}
          >
            {copied ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
      </div>

      {copied && (
        <div className="mt-2 text-sm text-green-600 font-medium">
          URL copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default UrlCopyComponent;
