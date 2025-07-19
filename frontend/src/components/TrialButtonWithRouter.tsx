"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export default function TrialButtonWithRouter() {
  const router = useRouter();

  const handleStartTrial = () => {
    router.push("/canvas");
  };

  return (
    <Button size="lg" className="text-lg px-8 py-6" onClick={handleStartTrial}>
      Start Free Trial
      <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
  );
}
