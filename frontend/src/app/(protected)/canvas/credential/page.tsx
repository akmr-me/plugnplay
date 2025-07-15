"use client";
import dynamic from "next/dynamic";
const CredentialManager = dynamic(
  () => import("@/components/credential/Manager"),
  {
    ssr: false,
  }
);

export default function Page() {
  return (
    <div>
      <CredentialManager />
    </div>
  );
}
