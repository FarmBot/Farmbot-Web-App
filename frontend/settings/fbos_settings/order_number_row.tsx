import React from "react";
import { Row, BlurableInput } from "../../ui";
import { DeviceSetting } from "../../constants";
import { OrderNumberRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { getModifiedClassNameSpecifyDefault } from "../default_values";
import { setOrderNumber } from "../../wizard/actions";

export const OrderNumberRow = (props: OrderNumberRowProps) =>
  <Highlight settingName={DeviceSetting.orderNumber}>
    <Row className="grid-2-col">
      <label>
        {t(DeviceSetting.orderNumber)}
      </label>
      <BlurableInput value={props.device.body.fb_order_number || ""}
        allowEmpty={true}
        className={getModifiedClassNameSpecifyDefault(
          props.device.body.fb_order_number, undefined,
        )}
        onCommit={e => props.dispatch(setOrderNumber(
          props.device, e.currentTarget.value))} />
    </Row>
  </Highlight>;
