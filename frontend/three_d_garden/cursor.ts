type CursorState = {
  overClickable: boolean;
  overSoil: boolean;
};

const state: CursorState = {
  overClickable: false,
  overSoil: false,
};

const getCursorTarget = (): HTMLElement | null => {
  if (typeof document === "undefined") { return null; }
  const gardenBedDiv =
    document.querySelector(".garden-bed-3d-model") as HTMLElement | null;
  return gardenBedDiv || document.body;
};

const applyCursor = () => {
  const target = getCursorTarget();
  if (!target) { return; }
  const cursor = state.overClickable
    ? "pointer"
    : state.overSoil
      ? "crosshair"
      : "move";
  target.style.cursor = cursor;
};

export const setClickableCursor = () => {
  state.overClickable = true;
  applyCursor();
};

export const clearClickableCursor = () => {
  state.overClickable = false;
  applyCursor();
};

export const setSoilCursor = () => {
  state.overSoil = true;
  applyCursor();
};

export const clearSoilCursor = () => {
  state.overSoil = false;
  applyCursor();
};

export const setGardenCursor = (cursor: string) => {
  switch (cursor) {
    case "pointer":
      setClickableCursor();
      break;
    case "crosshair":
      setSoilCursor();
      break;
    case "move":
      state.overClickable = false;
      state.overSoil = false;
      applyCursor();
      break;
    default: {
      const target = getCursorTarget();
      if (!target) { return; }
      target.style.cursor = cursor;
    }
  }
};

export const clearGardenCursor = () => clearClickableCursor();
