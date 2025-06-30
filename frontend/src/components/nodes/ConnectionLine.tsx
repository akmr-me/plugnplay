"use client";

import {
  ConnectionLineComponentProps,
  getSimpleBezierPath,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import React from "react";

export default function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  connectionStatus,
}: ConnectionLineComponentProps) {
  const [d] = getSimpleBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  const { theme } = useTheme();
  const isDark = theme == "dark";

  let color = "black";
  if (isDark) color = "white";
  if (connectionStatus === "valid") color = "#55dd99";
  if (connectionStatus === "invalid") color = "#ff6060";

  return <path fill="none" stroke={color} strokeWidth={1.5} d={d} />;
}
