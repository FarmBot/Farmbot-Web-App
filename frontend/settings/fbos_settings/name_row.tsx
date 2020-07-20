import * as React from "react";
import { Row, Col } from "../../ui/index";
import { DeviceSetting } from "../../constants";
import { NameRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { edit, save } from "../../api/crud";

export class NameRow extends React.Component<NameRowProps> {
  NameInput = () =>
    <input name="name"
      onChange={e => this.props.dispatch(edit(this.props.device, {
        name: e.currentTarget.value
      }))}
      onBlur={() => this.props.dispatch(save(this.props.device.uuid))}
      value={this.props.device.body.name} />;

  render() {
    return <Highlight settingName={DeviceSetting.name}>
      <Row>
        <Col xs={12}>
          <label>
            {t(DeviceSetting.name)}
          </label>
        </Col>
      </Row>
      <Row><this.NameInput /></Row>
    </Highlight>;
  }
}
