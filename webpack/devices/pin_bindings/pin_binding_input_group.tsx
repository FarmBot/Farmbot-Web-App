import * as React from "react";
import { t } from "i18next";
import { Row, Col, FBSelect, NULL_CHOICE } from "../../ui";
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
  bindingTypeLabelLookup, specialActionLabelLookup, specialActionList,
  reservedPiGPIO,
  bindingTypeList
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

  /** Validate and provide warnings about a selected pin number. */
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

  /** Generate a list of unavailable pin numbers. */
  get boundPins(): number[] {
    const userBindings = this.props.pinBindings.map(x => x.pin_number);
    return userBindings.concat(sysBindings);
  }

  /** Validate and save a pin binding. */
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

  /** pin number selection */
  pinNumberInputGroup = () => {
    const { pinNumberInput } = this.state;

    const selectedPinNumber = isNumber(pinNumberInput) ? {
      label: generatePinLabel(pinNumberInput),
      value: "" + pinNumberInput
    } : NULL_CHOICE;

    return <Row>
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
          selectedItem={selectedPinNumber}
          list={RpiPinList(this.boundPins)} />
      </Col>
    </Row>;
  }

  /** binding type selection: sequence or action */
  bindingTypeDropDown = () => {
    const { bindingType } = this.state;
    const { shouldDisplay } = this.props;
    return <FBSelect
      key={"binding_type_input_" + bindingType}
      onChange={(ddi: { label: string, value: PinBindingType }) =>
        this.setState({
          bindingType: ddi.value,
          sequenceIdInput: undefined,
          specialActionInput: undefined
        })}
      selectedItem={{
        label: bindingTypeLabelLookup[bindingType],
        value: bindingType
      }}
      list={bindingTypeList(shouldDisplay)} />;
  }

  /** sequence selection */
  sequenceTargetDropDown = () => {
    const { sequenceIdInput } = this.state;
    return <SequenceSelectBox
      key={sequenceIdInput}
      onChange={ddi =>
        this.setState({ sequenceIdInput: parseInt("" + ddi.value) })}
      resources={this.props.resources}
      sequenceId={sequenceIdInput} />;
  }

  /** special action selection */
  actionTargetDropDown = () => {
    const { specialActionInput } = this.state;

    const setSpecialAction =
      (ddi: { label: string, value: PinBindingSpecialAction }) =>
        this.setState({ specialActionInput: ddi.value });

    const selectedSpecialAction = specialActionInput ? {
      label: specialActionLabelLookup[specialActionInput || ""],
      value: "" + specialActionInput
    } : NULL_CHOICE;

    return <FBSelect
      key={"special_action_input_" + specialActionInput}
      onChange={setSpecialAction}
      selectedItem={selectedSpecialAction}
      list={specialActionList} />;
  }

  render() {
    const { bindingType } = this.state;

    return <Row>
      <Col xs={PinBindingColWidth.pin}>
        <this.pinNumberInputGroup />
      </Col>
      <Col xs={PinBindingColWidth.type}>
        <this.bindingTypeDropDown />
      </Col>
      <Col xs={PinBindingColWidth.target}>
        {bindingType == PinBindingType.special
          ? <this.actionTargetDropDown />
          : <this.sequenceTargetDropDown />}
      </Col>
      <Col xs={PinBindingColWidth.button}>
        <button
          className="fb-button green"
          type="button"
          onClick={this.bindPin} >
          {t("BIND")}
        </button>
      </Col>
    </Row>;
  }
}
