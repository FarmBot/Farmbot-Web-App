import * as React from "react";
import { Header } from "../hardware_settings/header";
import { Collapse, Popover, Position } from "@blueprintjs/core";
import { RestartRow } from "./restart_row";
import { ShutdownRow } from "./shutdown_row";
import { FactoryResetRow } from "./factory_reset_row";
import { PowerAndResetProps } from "./interfaces";
import { ChangeOwnershipForm } from "./change_ownership_form";
import { t } from "i18next";

export function PowerAndReset(props: PowerAndResetProps) {
  const { dispatch, sourceFbosConfig, shouldDisplay } = props;
  const { power_and_reset } = props.controlPanelState;
  return <section>
    <div style={{ fontSize: "1px" }}>
      <Header
        bool={power_and_reset}
        title={t("Power and Reset")}
        name={"power_and_reset"}
        dispatch={dispatch} />
    </div>
    <Collapse isOpen={!!power_and_reset}>
      <RestartRow />
      <ShutdownRow />
      <FactoryResetRow
        dispatch={dispatch}
        sourceFbosConfig={sourceFbosConfig} />
      {shouldDisplay("change_ownership") &&
        <Popover position={Position.BOTTOM_LEFT}>
          <p className={"release-notes-button"}>
            {t("Change Ownership")}&nbsp;
          <i className="fa fa-caret-down" />
          </p>
          <ChangeOwnershipForm />
        </Popover>}
    </Collapse>
  </section>;
}
