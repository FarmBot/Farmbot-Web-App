import React from "react";
import { Row, Col } from "../../ui";
import { DeviceSetting } from "../../constants";
import { OrderNumberRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { edit, save } from "../../api/crud";
import { getModifiedClassNameSpecifyDefault } from "../default_values";

export class OrderNumberRow extends React.Component<OrderNumberRowProps> {
  OrderNumberInput = () =>
    <input name="fb_order_number"
      className={getModifiedClassNameSpecifyDefault(
        this.props.device.body.fb_order_number, undefined,
      )}
      onChange={e => this.props.dispatch(edit(this.props.device, {
        fb_order_number: e.currentTarget.value
      }))}
      onBlur={() => this.props.dispatch(save(this.props.device.uuid))}
      value={this.props.device.body.fb_order_number} />;

  render() {
    return <Highlight settingName={DeviceSetting.orderNumber}>
      <Row>
        <Col xs={5}>
          <label>
            {t(DeviceSetting.orderNumber)}
          </label>
        </Col>
        <Col xs={7}>
          <this.OrderNumberInput />
        </Col>
      </Row>
    </Highlight>;
  }
}
