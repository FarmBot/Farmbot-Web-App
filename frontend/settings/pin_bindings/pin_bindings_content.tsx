import React from "react";
import { Row, Help, Popover } from "../../ui";
import { ToolTips, DeviceSetting } from "../../constants";
import { selectAllPinBindings } from "../../resources/selectors";
import { PinBindingsContentProps, PinBindingListItems } from "./interfaces";
import { PinBindingsList } from "./pin_bindings_list";
import { PinBindingInputGroup } from "./pin_binding_input_group";
import {
  StockPinBindingsButton, sysBtnBindingData,
} from "./tagged_pin_binding_init";
import { ResourceIndex } from "../../resources/interfaces";
import { Position, PopoverInteractionKind } from "@blueprintjs/core";
import {
  PinBindingSpecialAction,
  PinBindingType,
  PinBinding,
} from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";

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
export const apiPinBindings = (resources: ResourceIndex): PinBindingListItems[] => {
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

export const PinBindingsContent = (props: PinBindingsContentProps) => {
  const { dispatch, resources, firmwareHardware } = props;
  const pinBindings = apiPinBindings(resources);
  return <div className="pin-bindings">
    <Highlight settingName={DeviceSetting.stockPinBindings}>
      <Row className="grid-exp-3">
        <Help text={ToolTips.PIN_BINDINGS} />
        <Popover
          position={Position.TOP_RIGHT}
          interactionKind={PopoverInteractionKind.HOVER}
          portalClassName={"bindings-warning-icon"}
          popoverClassName={"help"}
          target={<i className="fa fa-exclamation-triangle" />}
          content={<div className={"pin-binding-warning"}>
            {t(ToolTips.PIN_BINDING_WARNING)}
          </div>} />
        <StockPinBindingsButton
          dispatch={dispatch} firmwareHardware={firmwareHardware} />
      </Row>
    </Highlight>
    <div className={"grid"}>
      <Highlight settingName={DeviceSetting.savedPinBindings}>
        <PinBindingsList
          pinBindings={pinBindings}
          dispatch={dispatch}
          resources={resources} />
      </Highlight>
      <Highlight settingName={DeviceSetting.addNewPinBinding}>
        <PinBindingInputGroup
          firmwareHardware={firmwareHardware}
          pinBindings={pinBindings}
          dispatch={dispatch}
          resources={resources} />
      </Highlight>
    </div>
  </div>;
};
