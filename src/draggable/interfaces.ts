import { SequenceBodyItem as Step } from "farmbot";
import { JSXChildren } from "../util";

/** An entry in the data transfer table. Used to transfer data from a "draggable"
 * to a "dropable". For type safety, this is a "tagged union". See Typescript
 * docs. */
export type DataXfer = StepSpliceDataXfer | StepMoveDataXfer;
/** For reference, a list of every possible DataXfer `intent` we support: */
export type DataXferIntent = "step_splice" | "step_move";

export interface DataXferBase {
  /** "who"" started the drag event*/
  draggerId: number;
  /** "what" you are dragging and dropping. */
  value: Step;
  /** "where" to find it in the state object (when it is dropped). */
  uuid: string;
  /** "why" the drag/drop event took place (tagged union-  See Typescript
   * documentation for more information). */
  intent: DataXferIntent;
}

/** Data transfer payload used when moving a *new* step into an existing step */
export interface StepSpliceDataXfer extends DataXferBase {
  intent: "step_splice";
}

/** Data transfer payload used when reordering an existing step. */
export interface StepMoveDataXfer extends DataXferBase {
  intent: "step_move";
}

/** Interface for store.draggable . */
export interface DraggableState {
  dataTransfer: { [key: string]: DataXfer | undefined };
}

/* Props for <DropArea /> */
export interface DropAreaProps {
  callback?: (key: string) => any;
  isLocked?: boolean;
}

/* State for <DropArea /> */
export interface DropAreaState {
  isHovered?: boolean;
}

export interface StepDraggerProps {
  dispatch: Function;
  step: Step;
  intent: DataXferIntent;
  ghostCss: string;
  children?: JSXChildren;
  draggerId: number;
}
