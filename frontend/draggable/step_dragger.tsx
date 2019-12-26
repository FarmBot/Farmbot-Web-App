import * as React from "react";
import { stepPut } from "./actions";
import { SequenceBodyItem as Step } from "farmbot";
import { DataXferIntent, StepDraggerProps } from "./interfaces";
import { UUID } from "../resources/interfaces";

/** Magic number to indicate that the draggerId was not provided or can't be
 *  known. */
export const NULL_DRAGGER_ID = 0xCAFEF00D;

/** This is an event handler that:
 *    Puts the step into the Redux store (and the drag event's dataTransfer)
 *    so that it can be pulled up when the "drop" event happens.
 *
 * Example usage:
 *
 * <button draggable={true}
 *         onDragStart={stepDragEventHandler(dispatch, step, "optnl-stuff")}>
 *   Drag this!
 * </button>
 * */
export const stepDragEventHandler = (dispatch: Function,
  step: Step,
  intent: DataXferIntent,
  draggerId: number,
  resourceUuid?: UUID) => {
  return (ev: React.DragEvent<HTMLElement>) => {
    dispatch(stepPut(step, ev, intent, draggerId, resourceUuid));
  };
};

export function StepDragger(props: StepDraggerProps) {
  const { dispatch, step, children, intent, draggerId, resourceUuid } = props;
  return <div className="step-dragger"
    onDragStart={stepDragEventHandler(dispatch,
      step,
      intent,
      draggerId,
      resourceUuid)}>
    {children}
  </div>;
}
