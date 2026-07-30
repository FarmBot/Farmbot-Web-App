import type { DropDownItem } from "../ui";
import { ASSETS } from "../three_d_garden/constants";

export const sceneObjectTextureChoices: DropDownItem[] =
  Object.keys(ASSETS.textures)
    .filter(textureType => !["screen", "cloud"].includes(textureType))
    .concat(["none"])
    .map(textureType => ({ label: textureType, value: textureType }));

const SHAPES_WITH_APPEARANCE = [
  "box",
  "cylinder",
  "sphere",
  "fence",
  "desk",
  "astronaut",
  "hab",
  "rover",
];

export const sceneObjectShowsTextureAndColor = (shape: string) =>
  SHAPES_WITH_APPEARANCE.includes(shape);

const DEFAULT_COLOR = "#434343";

export const validSceneObjectColor = (color: string) =>
  /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_COLOR;
