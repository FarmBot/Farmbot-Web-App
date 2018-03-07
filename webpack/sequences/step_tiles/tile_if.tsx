import * as React from "react";
import { StepParams } from "../interfaces";
import { InnerIf } from "./tile_if/index";

export function TileIf(props: StepParams) {
  if (props.currentStep.kind === "_if") {
    return <InnerIf
      currentSequence={props.currentSequence}
      currentStep={props.currentStep}
      dispatch={props.dispatch}
      index={props.index}
      resources={props.resources}
      installedOsVersion={props.installedOsVersion} />;
  } else {
    return <p> Expected "_if" node</p>;
  }
}
