import { CommandIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function Command() {
  return (
    <Button size="sm" className="text-[8px] h-4 px-1.5 rounded-[4px]">
      <CommandIcon />
    </Button>
  );
}
