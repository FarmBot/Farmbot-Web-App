import { BotPosition } from "../../../devices/interfaces";

export type PlantGridKey =
  | "startX"
  | "startY"
  | "spacingH"
  | "spacingV"
  | "numPlantsH"
  | "numPlantsV";
export type PlantGridData = Record<PlantGridKey, number>;

export interface PlantGridState {
  status: "clean" | "dirty",
  grid: PlantGridData;
  gridId: string;
  offsetPacking: boolean;
}

export interface PlantGridProps {
  xy_swap: boolean;
  openfarm_slug: string;
  cropName: string;
  dispatch: Function;
  botPosition: BotPosition;
  spread: number | undefined;
}

export interface PlantGridInitOption {
  grid: PlantGridData;
  gridId: string;
  offsetPacking: boolean;
  openfarm_slug: string;
  cropName: string;
}

interface GridInputPropsBase {
  grid: PlantGridData;
  xy_swap: boolean;
  onChange(key: PlantGridKey, value: number): void;
  preview(): void;
}

export interface GridInputProps extends GridInputPropsBase {
  disabled: boolean;
  botPosition: BotPosition;
  onUseCurrentPosition(position: Record<"x" | "y", number>): void;
}

export interface InputCellProps extends GridInputPropsBase {
  gridKey: PlantGridKey;
}

export interface PlantGridLabelData {
  /** A `font-awesome` icon next to the input box label.  */
  regular_icon: string;
  /** What icon should we use if the user has `xy_swap` enabled? */
  swapped_icon: string;
  label: string;
}
