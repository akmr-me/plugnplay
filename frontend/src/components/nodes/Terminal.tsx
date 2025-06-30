"use client";
import { Handle, HandleProps } from "@xyflow/react";
import React from "react";

export default function Terminal(props: HandleProps) {
  return <Handle className="w-2 h-2 bg-white border-2" {...props} />;
}
