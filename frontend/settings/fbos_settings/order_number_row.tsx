import React from "react";
import { Row, Col, BlurableInput } from "../../ui";
import { DeviceSetting } from "../../constants";
import { OrderNumberRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { getModifiedClassNameSpecifyDefault } from "../default_values";
import { setOrderNumber } from "../../wizard/actions";

export class OrderNumberRow extends React.Component<OrderNumberRowProps> {
  render() {
    return <Highlight settingName={DeviceSetting.orderNumber}>
      <Row>
        <Col xs={5}>
          <label>
            {t(DeviceSetting.orderNumber)}
          </label>
        </Col>
        <Col xs={7}>
          <BlurableInput value={this.props.device.body.fb_order_number || ""}
            allowEmpty={true}
            className={getModifiedClassNameSpecifyDefault(
              this.props.device.body.fb_order_number, undefined,
            )}
            onCommit={e => this.props.dispatch(setOrderNumber(
              this.props.device, e.currentTarget.value))} />
        </Col>
      </Row>
    </Highlight>;
  }
}
