import { MoveAbsolute } from "farmbot/dist";
export const TOOL: "Tool" = "Tool";

export interface InputBoxProps {
  onCommit(e: React.SyntheticEvent<HTMLInputElement>): void;
  children?: React.ReactNode;
  disabled?: boolean;
  name: string;
  value: string;
}

/** Union of all types found in a move_abs "args" attribute. */
export type LocationData = MoveAbsolute["args"]["location"];
