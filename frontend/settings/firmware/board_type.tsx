import React from "react";
import { Row, FBSelect } from "../../ui";
import { info, warning } from "../../toast/toast";
import { updateConfig } from "../../devices/actions";
import { BoardTypeProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import {
  FirmwareHardwareStatus, FlashFirmwareBtn,
} from "./firmware_hardware_status";
import {
  getFirmwareChoices, FIRMWARE_CHOICES_DDI, isUpgrade,
} from "./firmware_hardware_support";
import { Highlight } from "../maybe_highlight";
import { Content, DeviceSetting } from "../../constants";
import { getModifiedClassName } from "../fbos_settings/default_values";
import { FirmwareHardware } from "farmbot";

export const BoardType = (props: BoardTypeProps) => {
  const sending = !props.sourceFbosConfig("firmware_hardware").consistent;
  const { dispatch, firmwareHardware } = props;

  return <Highlight settingName={DeviceSetting.firmware}>
    <Row className="grid-2-col">
      <div className="row grid-exp-2">
        <label>
          {t("FIRMWARE")}
        </label>
        <FirmwareHardwareStatus
          botOnline={props.botOnline}
          apiFirmwareValue={firmwareHardware}
          alerts={props.alerts}
          bot={props.bot}
          dispatch={dispatch}
          timeSettings={props.timeSettings} />
        <FlashFirmwareBtn
          short={true}
          apiFirmwareValue={firmwareHardware}
          botOnline={props.botOnline} />
      </div>
      <FBSelect
        key={firmwareHardware + "" + sending}
        extraClass={[
          sending ? "dim" : "",
          getModifiedClassName("firmware_hardware",
            firmwareHardware, firmwareHardware),
        ].join(" ")}
        list={getFirmwareChoices()}
        selectedItem={firmwareHardware
          ? FIRMWARE_CHOICES_DDI[firmwareHardware]
          : undefined}
        onChange={ddi => {
          const firmware_hardware = ddi.value as FirmwareHardware;
          info(t("Sending firmware configuration..."), { title: t("Sending") });
          isUpgrade(firmwareHardware, firmware_hardware) &&
            warning(t(Content.FIRMWARE_UPGRADED),
              { title: t("Action may be required") });
          dispatch(updateConfig({ firmware_hardware }));
        }} />
    </Row>
  </Highlight>;
};
