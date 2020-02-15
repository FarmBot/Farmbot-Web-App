import * as React from "react";
import { PinBindingsProps } from "../interfaces";
import { Header } from "./header";
import { Collapse } from "@blueprintjs/core";
import { PinBindingsContent } from "../../pin_bindings/pin_bindings";

export function PinBindings(props: PinBindingsProps) {

  const { pin_bindings } = props.controlPanelState;
  const { dispatch, resources } = props;

  return <section>
    <Header
      expanded={pin_bindings}
      title={"Pin Bindings"}
      name={"pin_bindings"}
      dispatch={dispatch} />
    <Collapse isOpen={!!pin_bindings}>
      <PinBindingsContent dispatch={dispatch} resources={resources} />
    </Collapse>
  </section>;
}
