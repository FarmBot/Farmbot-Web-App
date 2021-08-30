import React from "react";
import { StepParams } from "../interfaces";
import { InnerIf } from "./tile_if/index";
import { If } from "farmbot";

export const TileIf = (props: StepParams<If>) =>
  <InnerIf
    currentSequence={props.currentSequence}
    currentStep={props.currentStep}
    dispatch={props.dispatch}
    readOnly={props.readOnly}
    index={props.index}
    resources={props.resources}
    showPins={props.showPins} />;
