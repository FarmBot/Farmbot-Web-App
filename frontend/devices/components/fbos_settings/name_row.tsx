import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { DeviceSetting } from "../../../constants";
import { ColWidth } from "../farmbot_os_settings";
import { NameRowProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { edit, save } from "../../../api/crud";
import { DevSettings } from "../../../account/dev/dev_support";

export class NameRow extends React.Component<NameRowProps> {
  NameInput = () =>
    <input name="name"
      onChange={e => this.props.dispatch(edit(this.props.device, {
        name: e.currentTarget.value
      }))}
      onBlur={() => this.props.dispatch(save(this.props.device.uuid))}
      value={this.props.device.body.name} />;

  render() {
    const newFormat = DevSettings.futureFeature1Enabled();
    return <Highlight settingName={DeviceSetting.name}>
      <Row>
        <Col xs={newFormat ? 12 : ColWidth.label}>
          <label>
            {t(DeviceSetting.name)}
          </label>
        </Col>
        {!newFormat && <Col xs={7}><this.NameInput /></Col>}
      </Row>
      {newFormat && <Row><this.NameInput /></Row>}
    </Highlight>;
  }
}
