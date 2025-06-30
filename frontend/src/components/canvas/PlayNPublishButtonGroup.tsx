import { Play, Rss } from "lucide-react";
import { Button } from "../ui/button";

export default function PlayNPublishButtonGroup() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">
        <Play /> Run Workflow
      </Button>
      <Button variant="outline" size="sm">
        <Rss /> Publish
      </Button>
    </div>
  );
}
