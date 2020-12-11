import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { UUID } from "../../../resources/interfaces";
import { ToolTransformProps } from "../../../tools/interfaces";
import { BotOriginQuadrant } from "../../interfaces";
import { ToolName } from "./all_tools";

export interface ToolGraphicProps {
  toolName: string | undefined;
  x: number;
  y: number;
  hovered: boolean;
  dispatch: Function;
  pulloutDirection: ToolPulloutDirection;
  flipped: boolean;
  toolTransformProps: ToolTransformProps;
  uuid: UUID | undefined;
}

export interface ToolProps {
  tool: ToolName;
  toolProps: ToolGraphicProps;
}

export interface ToolSlotGraphicProps {
  id: number | undefined;
  x: number;
  y: number;
  pulloutDirection: ToolPulloutDirection;
  quadrant: BotOriginQuadrant;
  xySwap: boolean;
  occupied: boolean;
}

export interface SlotAxisProfileProps {
  /** tool start */
  x: number;
  /** tool top */
  y: number;
  width: number;
  height: number;
  mirror?: boolean;
}

export interface SpecificToolProfileProps {
  /** tool center */
  x: number;
  /** tool bottom */
  y: number;
  toolFlipped: boolean;
  sideView: boolean;
}

export interface ToolImplementProfileProps
  extends SpecificToolProfileProps {
  toolName: string | undefined;
}

export interface GantryToolSlotGraphicProps {
  x: number;
  y: number;
  xySwap: boolean;
}

export interface ThreeInOneToolHeadProps {
  x: number;
  y: number;
  color: string;
  toolTransformProps: ToolTransformProps;
  pulloutDirection: ToolPulloutDirection;
}
