import React from "react";
import { Row } from "../../ui";
import { DeviceSetting } from "../../constants";
import { NameRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { edit, save } from "../../api/crud";
import { getModifiedClassNameSpecifyDefault } from "../default_values";

export class NameRow extends React.Component<NameRowProps> {
  NameInput = () =>
    <input name="farmbotName"
      className={getModifiedClassNameSpecifyDefault(
        this.props.device.body.name, "FarmBot",
      )}
      onChange={e => this.props.dispatch(edit(this.props.device, {
        name: e.currentTarget.value
      }))}
      onBlur={() => this.props.dispatch(save(this.props.device.uuid))}
      value={this.props.device.body.name} />;

  render() {
    return <Highlight settingName={DeviceSetting.name}>
      <Row className="grid-2-col">
        <label>
          {t(DeviceSetting.name)}
        </label>
        <this.NameInput />
      </Row>
    </Highlight>;
  }
}
