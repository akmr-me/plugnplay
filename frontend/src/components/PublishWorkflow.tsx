"use user";

import { Rss } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState } from "react";
import TemplateModal from "./TemplateManager";

export default function PublishWorkflow() {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const { user } = useUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  console.log(params, userEmail, process.env.NEXT_PUBLIC_ADMIN_EMAIL);

  if (
    !userEmail ||
    userEmail !== process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    !(params?.flowId && params?.projectId)
  )
    return null;

  const handleOpenChange = () => setIsOpen(true);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={handleOpenChange}
        loading={loading}
        disabled={loading}
      >
        <Rss /> Publish
      </Button>
      <TemplateModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isPublishing={loading}
        setIsPublishing={setLoading}
      />
    </>
  );
}
