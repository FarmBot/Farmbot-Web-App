import * as React from "react";
import { Header } from "../hardware_settings/header";
import { Collapse, Popover, Position } from "@blueprintjs/core";
import { RestartRow } from "./restart_row";
import { ShutdownRow } from "./shutdown_row";
import { FactoryResetRow } from "./factory_reset_row";
import { PowerAndResetProps } from "./interfaces";
import { ChangeOwnershipForm } from "./change_ownership_form";
import { t } from "i18next";
import { Feature } from "../../interfaces";

export function PowerAndReset(props: PowerAndResetProps) {
  const { dispatch, sourceFbosConfig, shouldDisplay, botOnline } = props;
  const { power_and_reset } = props.controlPanelState;
  return <section>
    <div style={{ fontSize: "1px" }}>
      <Header
        expanded={power_and_reset}
        title={t("Power and Reset")}
        name={"power_and_reset"}
        dispatch={dispatch} />
    </div>
    <Collapse isOpen={!!power_and_reset}>
      <RestartRow botOnline={botOnline} />
      <ShutdownRow botOnline={botOnline} />
      <FactoryResetRow
        dispatch={dispatch}
        sourceFbosConfig={sourceFbosConfig}
        botOnline={botOnline} />
      {shouldDisplay(Feature.change_ownership) && botOnline &&
        <Popover position={Position.BOTTOM_LEFT}>
          <p className={"release-notes-button"}>
            {t("Change Ownership")}&nbsp;
          <i className="fa fa-caret-down" />
          </p>
          <ChangeOwnershipForm />
        </Popover>
      }
    </Collapse>
  </section>;
}
