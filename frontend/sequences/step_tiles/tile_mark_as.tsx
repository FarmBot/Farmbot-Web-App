import React from "react";
import { StepParams } from "../interfaces";
import { UpdateResource } from "farmbot";
import { MarkAs } from "./tile_mark_as/component";

export const TileMarkAs = (props: StepParams<UpdateResource>) =>
  <MarkAs
    currentSequence={props.currentSequence}
    currentStep={props.currentStep}
    dispatch={props.dispatch}
    readOnly={props.readOnly}
    index={props.index}
    sequencesState={props.sequencesState}
    resources={props.resources} />;
