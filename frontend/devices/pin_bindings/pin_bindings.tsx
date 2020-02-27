import * as React from "react";
import { Row, Col, Help } from "../../ui";
import { ToolTips } from "../../constants";
import { selectAllPinBindings } from "../../resources/selectors";
import { PinBindingsContentProps, PinBindingListItems } from "./interfaces";
import { PinBindingsList } from "./pin_bindings_list";
import { PinBindingInputGroup } from "./pin_binding_input_group";
import {
  StockPinBindingsButton, sysBtnBindingData
} from "./tagged_pin_binding_init";
import { ResourceIndex } from "../../resources/interfaces";
import { Popover, Position, PopoverInteractionKind } from "@blueprintjs/core";
import {
  PinBindingSpecialAction,
  PinBindingType,
  PinBinding
} from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";

/** Width of UI columns in Pin Bindings widget. */
export enum PinBindingColWidth {
  pin = 4,
  type = 6,
  button = 2
}

/** Use binding type to return a sequence ID or a special action. */
const getBindingTarget = (bindingBody: PinBinding): {
  sequence_id: number | undefined,
  special_action: PinBindingSpecialAction | undefined
} => {
  return bindingBody.binding_type == PinBindingType.special
    ? { sequence_id: undefined, special_action: bindingBody.special_action }
    : { sequence_id: bindingBody.sequence_id, special_action: undefined };
};

/** Return API pin binding data. */
const apiPinBindings = (resources: ResourceIndex): PinBindingListItems[] => {
  const userBindings: PinBindingListItems[] = selectAllPinBindings(resources)
    .map(binding => {
      const { uuid, body } = binding;
      const sequence_id = getBindingTarget(body).sequence_id;
      const special_action = getBindingTarget(body).special_action;
      return {
        pin_number: body.pin_num,
        sequence_id,
        special_action,
        binding_type: body.binding_type,
        uuid: uuid
      };
    });
  return userBindings.concat(sysBtnBindingData);
};

const PinBindingsListHeader = () =>
  <Row>
    <Col xs={PinBindingColWidth.pin}>
      <label>
        {t("Pin Number")}
      </label>
    </Col>
    <Col xs={PinBindingColWidth.type}>
      <label>
        {t("Binding")}
      </label>
      <Help text={ToolTips.PIN_BINDINGS} />
    </Col>
  </Row>;

export const PinBindingsContent = (props: PinBindingsContentProps) => {
  const { dispatch, resources, firmwareHardware } = props;
  const pinBindings = apiPinBindings(resources);

  return <div className="pin-bindings">
    <Row>
      <StockPinBindingsButton
        dispatch={dispatch} firmwareHardware={firmwareHardware} />
      <Popover
        position={Position.RIGHT_TOP}
        interactionKind={PopoverInteractionKind.HOVER}
        portalClassName={"bindings-warning-icon"}
        popoverClassName={"help"}>
        <i className="fa fa-exclamation-triangle" />
        <div>
          {t(ToolTips.PIN_BINDING_WARNING)}
        </div>
      </Popover>
    </Row>
    <div>
      <PinBindingsListHeader />
      <PinBindingsList
        pinBindings={pinBindings}
        dispatch={dispatch}
        resources={resources} />
      <PinBindingInputGroup
        pinBindings={pinBindings}
        dispatch={dispatch}
        resources={resources} />
    </div>
  </div>;
};
