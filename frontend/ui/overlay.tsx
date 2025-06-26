import React from "react";
import {
  Overlay2 as BlueprintOverlay,
  OverlayProps,
} from "@blueprintjs/core";

export const Overlay = (props: OverlayProps) => {
  return <BlueprintOverlay {...props}>
    {props.children}
  </BlueprintOverlay>;
};
