"use client";

import {
  BaseEdge,
  EdgeProps,
  getSimpleBezierPath,
  EdgeLabelRenderer,
  getStraightPath,
  type Edge,
} from "@xyflow/react";
import React from "react";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import useHistory from "@/hooks/useHistory";

export default function Edge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data = {},
  selected,
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
  const [, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  const { removeEdge } = useHistory();

  return (
    <>
      <BaseEdge
        style={{
          stroke: "url(#edge)",
        }}
        markerEnd={markerEnd}
        path={d}
      />
      {selected && (
        <EdgeLabelRenderer>
          <Button
            variant="ghost"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            onClick={() => removeEdge({ id: rest.id } as Edge)}
          >
            <Trash2 color="red" />
          </Button>
        </EdgeLabelRenderer>
      )}
      {!data.activate && (
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
