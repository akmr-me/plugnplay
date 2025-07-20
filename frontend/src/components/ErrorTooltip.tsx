import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { AlertTriangleIcon } from "lucide-react";
import ErrorMessage from "./ErrorMessage";

export default function ErrorTooltip({ error }: { error: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="absolute top-0 right-0 z-50">
          <AlertTriangleIcon className="w-4 h-4 mt-0.5 text-red-500" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="w-md">
        {/* <p className="text-xs text-muted-foreground leading-relaxed break-all whitespace-pre-wrap w-20">
              {data.error}
            </p> */}
        <ErrorMessage message={error} transparent={true} />
      </TooltipContent>
    </Tooltip>
  );
}
