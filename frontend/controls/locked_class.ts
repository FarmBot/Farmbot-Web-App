/**
 * Returns className for styling movement and pin control command buttons
 * depending on e-stop status.
 */
export const lockedClass = (locked: boolean | undefined) =>
  locked ? "pseudo-disabled" : "";
