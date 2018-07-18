import * as React from "react";
import { t } from "i18next";
import { Row, Col, DropDownItem, FBSelect, NULL_CHOICE } from "../../ui";
import { PinBindingColWidth } from "./pin_bindings";
import { Popover, Position } from "@blueprintjs/core";
import { RpiGpioDiagram } from "./rpi_gpio_diagram";
import {
  PinBindingType, PinBindingSpecialAction,
  PinBindingInputGroupProps, PinBindingInputGroupState
} from "./interfaces";
import { isNumber, includes } from "lodash";
import { Feature } from "../interfaces";
import { initSave } from "../../api/crud";
import { taggedPinBinding } from "./tagged_pin_binding_init";
import { registerGpioPin } from "../actions";
import { error, warning } from "farmbot-toastr";
import {
  validGpioPins, sysBindings, generatePinLabel, RpiPinList,
  bindingTypeLabelLookup, specialActionLabelLookup, specialActionList, reservedPiGPIO
} from "./list_and_label_support";
import { SequenceSelectBox } from "../../sequences/sequence_select_box";

export class PinBindingInputGroup
  extends React.Component<PinBindingInputGroupProps, PinBindingInputGroupState> {
  state = {
    isEditing: false,
    pinNumberInput: undefined,
    sequenceIdInput: undefined,
    specialActionInput: undefined,
    bindingType: PinBindingType.standard,
  };

  changeSelection = (input: DropDownItem) => {
    this.setState({ sequenceIdInput: parseInt("" + input.value) });
  }

  setSelectedPin = (pin: number | undefined) => {
    if (!includes(this.boundPins, pin)) {
      if (includes(validGpioPins, pin)) {
        this.setState({ pinNumberInput: pin });
        if (includes(reservedPiGPIO, pin)) {
          warning(t("Reserved Raspberry Pi pin may not work as expected."));
        }
      } else {
        error(t("Invalid Raspberry Pi GPIO pin number."));
      }
    } else {
      error(t("Raspberry Pi GPIO pin already bound."));
    }
  }

  get boundPins(): number[] | undefined {
    const userBindings = this.props.pinBindings.map(x => x.pin_number);
    return userBindings.concat(sysBindings);
  }

  bindPin = () => {
    const { shouldDisplay, dispatch } = this.props;
    const {
      pinNumberInput, sequenceIdInput, bindingType, specialActionInput
    } = this.state;
    if (isNumber(pinNumberInput)) {
      if (bindingType && (sequenceIdInput || specialActionInput)) {
        if (shouldDisplay(Feature.api_pin_bindings)) {
          dispatch(initSave(
            bindingType == PinBindingType.special
              ? taggedPinBinding({
                pin_num: pinNumberInput,
                special_action: specialActionInput,
                binding_type: bindingType
              })
              : taggedPinBinding({
                pin_num: pinNumberInput,
                sequence_id: sequenceIdInput,
                binding_type: bindingType
              })));
        } else {
          dispatch(registerGpioPin({
            pin_number: pinNumberInput,
            sequence_id: sequenceIdInput || 0
          }));
        }
        this.setState({
          pinNumberInput: undefined,
          sequenceIdInput: undefined,
          specialActionInput: undefined,
          bindingType: PinBindingType.standard,
        });
      } else {
        error(t("Please select a sequence or action."));
      }
    } else {
      error(t("Pin number cannot be blank."));
    }
  }

  render() {
    const {
      pinNumberInput, sequenceIdInput, bindingType, specialActionInput
    } = this.state;

    return <Row>
      <Col xs={PinBindingColWidth.pin}>
        <Row>
          <Col xs={1}>
            <Popover position={Position.TOP}>
              <i className="fa fa-th-large" />
              <RpiGpioDiagram
                boundPins={this.boundPins}
                setSelectedPin={this.setSelectedPin}
                selectedPin={this.state.pinNumberInput} />
            </Popover>
          </Col>
          <Col xs={9}>
            <FBSelect
              key={"pin_number_input_" + pinNumberInput}
              onChange={ddi =>
                this.setSelectedPin(parseInt("" + ddi.value))}
              selectedItem={isNumber(pinNumberInput)
                ? {
                  label: generatePinLabel(pinNumberInput),
                  value: "" + pinNumberInput
                }
                : NULL_CHOICE}
              list={RpiPinList(this.boundPins || [])} />
          </Col>
        </Row>
      </Col>
      <Col xs={PinBindingColWidth.type}>
        <FBSelect
          key={"binding_type_input_" + pinNumberInput}
          onChange={(ddi: { label: string, value: PinBindingType }) =>
            this.setState({ bindingType: ddi.value })}
          selectedItem={{
            label: bindingTypeLabelLookup[bindingType],
            value: bindingType
          }}
          list={Object.entries(bindingTypeLabelLookup)
            .filter(([value, _]) => !(value == ""))
            .map(([value, label]) => ({ label, value }))} />
      </Col>
      <Col xs={PinBindingColWidth.target}>
        {bindingType == PinBindingType.special
          ? <FBSelect
            key={"special_action_input_" + pinNumberInput}
            onChange={
              (ddi: { label: string, value: PinBindingSpecialAction }) =>
                this.setState({ specialActionInput: ddi.value })}
            selectedItem={specialActionInput
              ? {
                label: specialActionLabelLookup[specialActionInput || ""],
                value: "" + specialActionInput
              }
              : NULL_CHOICE}
            list={specialActionList} />
          : <SequenceSelectBox
            key={sequenceIdInput}
            onChange={this.changeSelection}
            resources={this.props.resources}
            sequenceId={sequenceIdInput} />}
      </Col>
      <Col xs={PinBindingColWidth.button}>
        <button
          className="fb-button green"
          type="button"
          onClick={() => { this.bindPin(); }} >
          {t("BIND")}
        </button>
      </Col>
    </Row>;
  }
}
