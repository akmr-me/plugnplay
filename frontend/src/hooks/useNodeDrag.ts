import { useFlowActions } from "@/stores";

export default function useNodeDrag(type: string) {
  const { setDraggingNodeType } = useFlowActions();

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    console.log("type derag staret", type);
    // document.body.classList.add("dragging");
    // document.body.style.cursor = "grabbing";
    // // e.dataTransfer.effectAllowed = "move"; // or "copy", "link", "all"
    // e.dataTransfer.setData("text/plain", "");
    // Create styled drag image
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", ""); // Required for Firefox
    // e.dataTransfer.setDate("nodetype", type);
    const dragImage = e.target.cloneNode(true);
    setDraggingNodeType(type);
    // Hide details element
    const detailsElement = dragImage.querySelector(".details");
    if (detailsElement) {
      detailsElement.style.display = "none";
    }
    // const buttonSVGElement = dragImage.querySelector("button svg");
    // if (buttonSVGElement) {
    //   buttonSVGElement.style.cssText = `
    //   height: 32px !important;
    //   width: 32px !important;`;
    // }
    const buttonElement = dragImage.querySelector("button svg");
    if (buttonElement) {
      buttonElement.style.cssText = `
        height: 128px !important;
        width: 128px !important;
        background-color: rgba(255, 255, 255, 0.7) !important;
        border: 2px solid !important;
        border-radius: 10% !important;
        
        `;
    }
    // Style the drag image with important declarations
    dragImage.style.cssText = `
        opacity: 1 !important;
        transform: scale(1) !important;
        position: absolute !important;
        top: -1000px !important;
        left: -1000px !important;
        pointer-events: none !important;
        z-index: 9999 !important;
      `;

    document.body.appendChild(dragImage);

    // Force a reflow to ensure styles are applied
    dragImage.offsetHeight;

    // Set drag image with minimal offset
    e.dataTransfer.setDragImage(dragImage, 40, 40);

    // Clean up after drag starts
    requestAnimationFrame(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    });
  };
  return handleDragStart;
}
