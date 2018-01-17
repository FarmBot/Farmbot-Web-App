import * as React from "react";
import { Header } from "../hardware_settings/header";
import { Collapse } from "@blueprintjs/core";
import { BotState } from "../../interfaces";
import { RestartRow } from "./restart_row";
import { ShutdownRow } from "./shutdown_row";
import { FactoryResetRow } from "./factory_reset_row";

export interface PowerAndResetProps {
  bot: BotState;
  dispatch: Function;
}

export function PowerAndReset(props: PowerAndResetProps) {
  const { bot, dispatch } = props;
  const { power_and_reset } = bot.controlPanelState;
  return <section>
    <div style={{ fontSize: "1px" }}>
      <Header
        bool={power_and_reset}
        title={"Power and Reset"}
        name={"power_and_reset"}
        dispatch={dispatch} />
    </div>
    <Collapse isOpen={!!power_and_reset}>
      <RestartRow dispatch={props.dispatch} />
      <ShutdownRow />
      <FactoryResetRow bot={bot} dispatch={dispatch} />
    </Collapse>
  </section>;
}
