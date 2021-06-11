import React from "react";
import { Header } from "../hardware_settings/header";
import { Collapse } from "@blueprintjs/core";
import { FactoryResetRows } from "./factory_reset_row";
import { PowerAndResetProps } from "./interfaces";
import { FbosButtonRow } from "./fbos_button_row";
import { Content, DeviceSetting } from "../../constants";
import { reboot, powerOff } from "../../devices/actions";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

export function PowerAndReset(props: PowerAndResetProps) {
  const { dispatch, botOnline } = props;
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
      <FactoryResetRows botOnline={botOnline} />
    </Collapse>
  </Highlight>;
}
