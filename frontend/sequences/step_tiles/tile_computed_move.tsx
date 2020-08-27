import React from "react";
import { StepParams } from "../interfaces";
import { ComputedMove } from "./tile_computed_move/component";
import { Move } from "farmbot";

export const TileComputedMove = (props: StepParams<Move>) =>
  <ComputedMove
    currentSequence={props.currentSequence}
    currentStep={props.currentStep}
    dispatch={props.dispatch}
    index={props.index}
    resources={props.resources}
    hardwareFlags={props.hardwareFlags}
    expandStepOptions={!!props.expandStepOptions}
    shouldDisplay={props.shouldDisplay} />;
