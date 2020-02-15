import * as React from "react";
import { Header } from "../hardware_settings/header";
import { Collapse, Popover, Position } from "@blueprintjs/core";
import { FactoryResetRow } from "./factory_reset_row";
import { PowerAndResetProps } from "./interfaces";
import { ChangeOwnershipForm } from "./change_ownership_form";
import { FbosButtonRow } from "./fbos_button_row";
import { Content } from "../../../constants";
import { reboot, powerOff, restartFirmware } from "../../actions";
import { t } from "../../../i18next_wrapper";

export function PowerAndReset(props: PowerAndResetProps) {
  const { dispatch, sourceFbosConfig, botOnline } = props;
  const { power_and_reset } = props.controlPanelState;
  return <section>
    <Header
      expanded={power_and_reset}
      title={t("Power and Reset")}
      name={"power_and_reset"}
      dispatch={dispatch} />
    <Collapse isOpen={!!power_and_reset}>
      <FbosButtonRow
        botOnline={botOnline}
        label={t("RESTART FARMBOT")}
        description={Content.RESTART_FARMBOT}
        buttonText={t("RESTART")}
        color={"yellow"}
        action={reboot} />
      <FbosButtonRow
        botOnline={botOnline}
        label={t("SHUTDOWN FARMBOT")}
        description={Content.SHUTDOWN_FARMBOT}
        buttonText={t("SHUTDOWN")}
        color={"red"}
        action={powerOff} />
      <FbosButtonRow
        botOnline={botOnline}
        label={t("RESTART FIRMWARE")}
        description={Content.RESTART_FIRMWARE}
        buttonText={t("RESTART")}
        color={"yellow"}
        action={restartFirmware} />
      <FactoryResetRow
        dispatch={dispatch}
        sourceFbosConfig={sourceFbosConfig}
        botOnline={botOnline} />
      {botOnline &&
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
