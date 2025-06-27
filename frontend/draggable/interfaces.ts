import { SequenceBodyItem as Step } from "farmbot";
import { UUID } from "../resources/interfaces";

/** An entry in the data transfer table. Used to transfer data from a "draggable"
 * to a "droppable". For type safety, this is a "tagged union". See Typescript
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
  /** Optional resource UUID. */
  resourceUuid?: UUID;
}

/** Data transfer payload used when moving a *new* step into an existing step */
interface StepSpliceDataXfer extends DataXferBase {
  intent: "step_splice";
}

/** Data transfer payload used when reordering an existing step. */
interface StepMoveDataXfer extends DataXferBase {
  intent: "step_move";
}

export interface DraggableState {
  dataTransfer: { [key: string]: DataXfer | undefined };
}

export interface DropAreaProps {
  callback(key: string): void;
  isLocked?: boolean;
  children?: React.ReactNode;
}

export interface DropAreaState {
  isHovered?: boolean;
}

export interface StepDraggerProps {
  dispatch: Function;
  step: Step;
  intent: DataXferIntent;
  children?: React.ReactNode;
  draggerId: number;
  resourceUuid?: UUID;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}
