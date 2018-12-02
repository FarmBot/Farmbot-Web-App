import { ResourceIndex } from "../../../resources/interfaces";
import { MoveAbsolute, PointType } from "farmbot/dist";
import { ShouldDisplay } from "../../../devices/interfaces";
import { MoveAbsDropDownContents } from "../../../resources/sequence_meta";
export const TOOL: "Tool" = "Tool";

export type CALLBACK = (out: MoveAbsDropDownContents) => void;

export interface TileMoveAbsProps {
  resources: ResourceIndex;
  /** UUID of current sequence */
  uuid: string;
  selectedItem: LocationData;
  onChange: CALLBACK;
  shouldDisplay: ShouldDisplay;
}

export interface InputBoxProps {
  onCommit(e: React.SyntheticEvent<HTMLInputElement>): void;
  children?: React.ReactNode;
  disabled?: boolean;
  name: string;
  value: string;
}

/** Union of all types found in a move_abs "args" attribute. */
export type LocationData = MoveAbsolute["args"]["location"];

/** Union of all possible `headingId` values in the move abs dropdown. */
export type KnownGroupTag = PointType | typeof TOOL | "identifier";
