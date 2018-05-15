import { getMode, Mode } from "./garden_map";

export const maybeNoPointer =
  (defaultStyle: React.CSSProperties): React.SVGProps<SVGGElement>["style"] => {
    switch (getMode()) {
      case Mode.boxSelect:
      case Mode.clickToAdd:
      case Mode.moveTo:
      case Mode.createPoint:
        return { "pointerEvents": "none" };
      default:
        return defaultStyle;
    }
  };
