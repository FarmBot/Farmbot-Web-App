import * as React from "react";
import { Header } from "../hardware_settings/header";
import { Collapse, Popover, Position } from "@blueprintjs/core";
import { FactoryResetRows } from "./factory_reset_row";
import { PowerAndResetProps } from "./interfaces";
import { ChangeOwnershipForm } from "./change_ownership_form";
import { FbosButtonRow } from "./fbos_button_row";
import { Content, DeviceSetting } from "../../../constants";
import { reboot, powerOff, restartFirmware } from "../../actions";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DevSettings } from "../../../account/dev/dev_support";

export function PowerAndReset(props: PowerAndResetProps) {
  const { dispatch, sourceFbosConfig, botOnline } = props;
  const { power_and_reset } = props.controlPanelState;
  return <Highlight className={"section"}
    settingName={DeviceSetting.powerAndReset}>
    <Header
      expanded={power_and_reset}
      title={DeviceSetting.powerAndReset}
      panel={"power_and_reset"}
      dispatch={dispatch} />
    <Collapse isOpen={!!power_and_reset}>
      <FbosButtonRow
        botOnline={botOnline}
        label={DeviceSetting.restartFarmbot}
        description={Content.RESTART_FARMBOT}
        buttonText={t("RESTART")}
        color={"yellow"}
        action={reboot} />
      <FbosButtonRow
        botOnline={botOnline}
        label={DeviceSetting.shutdownFarmbot}
        description={Content.SHUTDOWN_FARMBOT}
        buttonText={t("SHUTDOWN")}
        color={"red"}
        action={powerOff} />
      {!DevSettings.futureFeaturesEnabled() &&
        <FbosButtonRow
          botOnline={botOnline}
          label={DeviceSetting.restartFirmware}
          description={Content.RESTART_FIRMWARE}
          buttonText={t("RESTART")}
          color={"yellow"}
          action={restartFirmware} />}
      <FactoryResetRows
        dispatch={dispatch}
        sourceFbosConfig={sourceFbosConfig}
        botOnline={botOnline} />
      {botOnline &&
        <Highlight settingName={DeviceSetting.changeOwnership}>
          <Popover position={Position.BOTTOM_LEFT}>
            <p className={"release-notes-button"}>
              {t(DeviceSetting.changeOwnership)}&nbsp;
              <i className="fa fa-caret-down" />
            </p>
            <ChangeOwnershipForm />
          </Popover>
        </Highlight>}
    </Collapse>
  </Highlight>;
}
