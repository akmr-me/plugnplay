"use client";
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  getSimpleBezierPath,
} from "@xyflow/react";
import React from "react";

export default function Edge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data = {},
  ...rest
}: EdgeProps) {
  const [d] = getSimpleBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  console.log("custom edge", rest, data.activate, data);
  return (
    <>
      <BaseEdge
        style={{
          stroke: "url(#edge)",
        }}
        markerEnd={markerEnd}
        path={d}
      />
      {data.activate && (
        <>
          <circle
            r="4"
            fill="yellow"
            style={{
              filter: "drop-shadow(0px 0px 2px #FFC300)",
            }}
          >
            <animateMotion dur="6s" repeatCount={"indefinite"} path={d} />
          </circle>
          <circle fill="transparent" stroke="yellow" strokeWidth={2}>
            <animate
              attributeName="r"
              values="2;6"
              dur="2s"
              repeatCount={"indefinite"}
            />
            <animate
              attributeName="opacity"
              values="1;0"
              dur="2s"
              repeatCount={"indefinite"}
            />
            <animateMotion dur="6s" repeatCount={"indefinite"} path={d} />
          </circle>
        </>
      )}
    </>
  );
}
