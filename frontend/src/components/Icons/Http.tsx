"use client";
import { SVGProps } from "react";

export function HttpGet(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 8H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v-4H6m8-4h-4v8h4m-4-4h2.5M17 8h4m-2 0v8"
      ></path>
    </svg>
  );
}
