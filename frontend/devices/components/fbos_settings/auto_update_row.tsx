import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { ColWidth } from "../farmbot_os_settings";
import { ToggleButton } from "../../../controls/toggle_button";
import { updateConfig } from "../../actions";
import { Content } from "../../../constants";
import { AutoUpdateRowProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { OtaTimeSelector, changeOtaHour } from "./ota_time_selector";
import { Feature } from "../../interfaces";

export function AutoUpdateRow(props: AutoUpdateRowProps) {
  const osAutoUpdate = props.sourceFbosConfig("os_auto_update");

  return <div>
    {props.shouldDisplay(Feature.ota_update_hour) && <OtaTimeSelector
      timeFormat={props.timeFormat}
      disabled={!osAutoUpdate.value}
      value={props.device.body.ota_hour}
      onChange={changeOtaHour(props.dispatch, props.device)} />}
    <Row>
      <Col xs={ColWidth.label}>
        <label>
          {t("FARMBOT OS AUTO UPDATE")}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <p>
          {t(Content.OS_AUTO_UPDATE)}
        </p>
      </Col>
      <Col xs={ColWidth.button}>
        <ToggleButton toggleValue={osAutoUpdate.value}
          dim={!osAutoUpdate.consistent}
          toggleAction={() => props.dispatch(updateConfig({
            os_auto_update: !osAutoUpdate.value
          }))} />
      </Col>
    </Row>
  </div>;
}
