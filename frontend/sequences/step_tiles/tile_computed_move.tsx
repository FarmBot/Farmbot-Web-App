import React from "react";
import { StepParams } from "../interfaces";
import { ComputedMove } from "./tile_computed_move/component";

export function TileComputedMove(props: StepParams) {
  if (props.currentStep.kind === "move") {
    return <ComputedMove
      currentSequence={props.currentSequence}
      currentStep={props.currentStep}
      dispatch={props.dispatch}
      index={props.index}
      resources={props.resources}
      confirmStepDeletion={props.confirmStepDeletion}
      hardwareFlags={props.hardwareFlags}
      expandStepOptions={!!props.expandStepOptions}
      shouldDisplay={props.shouldDisplay}
      viewCeleryScript={!!props.viewCeleryScript} />;
  } else {
    return <p>{"Expected `move` node"}</p>;
  }
}
