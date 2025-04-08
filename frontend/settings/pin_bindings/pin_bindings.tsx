import React from "react";
import { PinBindingsProps } from "./interfaces";
import { Header } from "../hardware_settings/header";
import { Collapse } from "@blueprintjs/core";
import { PinBindingsContent } from "./pin_bindings_content";
import { DeviceSetting } from "../../constants";
import { Highlight } from "../maybe_highlight";

export const PinBindings = (props: PinBindingsProps) => {

  const { pin_bindings } = props.settingsPanelState;
  const { dispatch, resources, firmwareHardware } = props;

  return <Highlight className={"section advanced"}
    settingName={DeviceSetting.pinBindings}
    hidden={true}>
    <Header
      expanded={pin_bindings}
      title={DeviceSetting.pinBindings}
      panel={"pin_bindings"}
      dispatch={dispatch} />
    <Collapse isOpen={!!pin_bindings}>
      <PinBindingsContent dispatch={dispatch} resources={resources}
        firmwareHardware={firmwareHardware} />
    </Collapse>
  </Highlight>;
};
