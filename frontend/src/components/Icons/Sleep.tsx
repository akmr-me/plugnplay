"use client";
import { SVGProps } from "react";

export function Sleep(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M3.725 18.963v-1.26l5.805-7.635H3.89V8.313h8.58v1.26l-5.835 7.635h6l-.405 1.755zm9.837-6.282l-.221-1.242l4.154-4.879H13.43l.207-1.523h6.195l.207 1.36l-3.992 4.747h4.229l-.222 1.537h-6.49Z"
      ></path>
    </svg>
  );
}
