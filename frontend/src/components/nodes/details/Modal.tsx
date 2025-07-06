import { Dialog, DialogContent, DialogPortal } from "@/components/ui/dialog";

export default function DetailsModal({ setSelectedNode, children }) {
  const closeDialog = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof setSelectedNode === "function") {
      setSelectedNode(undefined);
    }
  };
  return (
    <Dialog open>
      <DialogPortal container={document.getElementById("dialog-portal")}>
        <DialogContent
          className="overflow-x-hidden h-screen flex items-center bg-white/50 dark:bg-black/50 gap-2 px-4 max-w-screen! w-screen"
          onClick={closeDialog}
        >
          {children}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
