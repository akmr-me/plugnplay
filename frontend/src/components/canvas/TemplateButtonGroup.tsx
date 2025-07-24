import { GitFork, TvMinimalPlay } from "lucide-react";
import { Button } from "../ui/button";
import ForkTemplateModal from "../ForkTemplateModal";
import { useState } from "react";

export default function TemplateButtonGroup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isForking, setIsForking] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={() => setIsOpen(true)}
        disabled={isForking}
        loading={isForking}
      >
        <GitFork /> Fork
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        // onClick={handleRunWorkflow}
        disabled={true}
        loading={isForking}
        title="Coming soon!"
      >
        <TvMinimalPlay /> Test Workflow
      </Button>
      <ForkTemplateModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        isForking={isForking}
        setIsForking={setIsForking}
      />
    </div>
  );
}
