import * as React from "react";
import { StepParams } from "../interfaces";
import { MarkAs } from "./tile_mark_as/component";

export function TileMarkAs(props: StepParams) {
  if (props.currentStep.kind === "update_resource") {
    return <MarkAs
      currentSequence={props.currentSequence}
      currentStep={props.currentStep}
      dispatch={props.dispatch}
      index={props.index}
      resources={props.resources}
      confirmStepDeletion={props.confirmStepDeletion} />;
  } else {
    return <p>{"Expected `update_resource` node"}</p>;
  }
}
