import * as React from "react";

/** Creates a "ghost image" for a React element while it is dragged.
 * Returns HTMLDOMElement of the ghost image
 */
export function addGhostImage(
  /** Drag event created by onDragStart() */
  ev: React.DragEvent<HTMLElement>,
  /** Optional CSS class to add to drag image. */
  cssClass = "") {
  var el = ev.currentTarget.cloneNode(true) as HTMLElement;
  // RELEVANT READING:
  // https://www.kryogenix.org/code/browser/custom-drag-image.html
  el.classList.add(cssClass);
  el.style.left = "-30000px";
  el.style.position = "absolute";
  document.body.addEventListener("dragend", function () {
    el.remove();
  });
  document.body.appendChild(el);
  // Because of MS Edge.
  // I really could care less about IE, but edge seems
  // to be OK aside from this one issue.
  let dt = (ev.dataTransfer as any);
  if (dt && dt.setDragImage) {
    dt.setDragImage(el, 0, 0);
  }
  return el;
}
