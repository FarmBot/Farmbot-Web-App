import * as React from "react";
import { Row, Col, FBSelect, NULL_CHOICE, DropDownItem } from "../../ui";
import { PinBindingColWidth } from "./pin_bindings";
import { Popover, Position } from "@blueprintjs/core";
import { RpiGpioDiagram } from "./rpi_gpio_diagram";
import {
  PinBindingInputGroupProps,
  PinBindingInputGroupState
} from "./interfaces";
import { isNumber, includes } from "lodash";
import { initSave } from "../../api/crud";
import { pinBindingBody } from "./tagged_pin_binding_init";
import { error, warning } from "../../toast/toast";
import {
  validGpioPins, sysBindings, generatePinLabel, RpiPinList,
  bindingTypeLabelLookup, specialActionLabelLookup, specialActionList,
  reservedPiGPIO,
  bindingTypeList
} from "./list_and_label_support";
import { SequenceSelectBox } from "../../sequences/sequence_select_box";
import { ResourceIndex } from "../../resources/interfaces";
import {
  PinBindingType, PinBindingSpecialAction
} from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";

export class PinBindingInputGroup
  extends React.Component<PinBindingInputGroupProps, PinBindingInputGroupState> {
  state: PinBindingInputGroupState = {
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
      error(t("Raspberry Pi GPIO pin already bound or in use."));
    }
  }

  /** Generate a list of unavailable pin numbers. */
  get boundPins(): number[] {
    const userBindings = this.props.pinBindings.map(x => x.pin_number);
    return userBindings.concat(sysBindings);
  }

  /** Validate and save a pin binding. */
  bindPin = () => {
    const { dispatch } = this.props;
    const {
      pinNumberInput, sequenceIdInput, bindingType, specialActionInput
    } = this.state;
    if (isNumber(pinNumberInput)) {
      if (bindingType && (sequenceIdInput || specialActionInput)) {
        bindingType == PinBindingType.special
          ? dispatch(initSave("PinBinding", pinBindingBody({
            pin_num: pinNumberInput,
            special_action: specialActionInput,
            binding_type: bindingType
          })))
          : dispatch(initSave("PinBinding", pinBindingBody({
            pin_num: pinNumberInput,
            sequence_id: sequenceIdInput,
            binding_type: bindingType
          })));
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

  setBindingType = (ddi: { label: string, value: PinBindingType }) =>
    this.setState({
      bindingType: ddi.value,
      sequenceIdInput: undefined,
      specialActionInput: undefined
    })

  setSequenceIdInput = (ddi: DropDownItem) =>
    this.setState({ sequenceIdInput: parseInt("" + ddi.value) })

  setSpecialAction =
    (ddi: { label: string, value: PinBindingSpecialAction }) =>
      this.setState({ specialActionInput: ddi.value });

  render() {
    const {
      pinNumberInput, bindingType, specialActionInput, sequenceIdInput
    } = this.state;

    return <Row>
      <Col xs={PinBindingColWidth.pin}>
        <PinNumberInputGroup
          pinNumberInput={pinNumberInput}
          boundPins={this.boundPins}
          setSelectedPin={this.setSelectedPin} />
      </Col>
      <Col xs={PinBindingColWidth.type}>
        <BindingTypeDropDown
          bindingType={bindingType}
          setBindingType={this.setBindingType} />
      </Col>
      <Col xs={PinBindingColWidth.target}>
        {bindingType == PinBindingType.special
          ? <ActionTargetDropDown
            specialActionInput={specialActionInput}
            setSpecialAction={this.setSpecialAction} />
          : <SequenceTargetDropDown
            sequenceIdInput={sequenceIdInput}
            resources={this.props.resources}
            setSequenceIdInput={this.setSequenceIdInput} />}
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

/** pin number selection */
export const PinNumberInputGroup = (props: {
  pinNumberInput: number | undefined,
  boundPins: number[],
  setSelectedPin: (pin: number | undefined) => void
}) => {
  const { pinNumberInput, boundPins, setSelectedPin } = props;
  const selectedPinNumber = isNumber(pinNumberInput) ? {
    label: generatePinLabel(pinNumberInput),
    value: "" + pinNumberInput
  } : NULL_CHOICE;

  return <Row>
    <Col xs={1}>
      <Popover position={Position.TOP}>
        <i className="fa fa-th-large" />
        <RpiGpioDiagram
          boundPins={boundPins}
          setSelectedPin={setSelectedPin}
          selectedPin={pinNumberInput} />
      </Popover>
    </Col>
    <Col xs={9}>
      <FBSelect
        key={"pin_number_input_" + pinNumberInput}
        onChange={ddi =>
          setSelectedPin(parseInt("" + ddi.value))}
        selectedItem={selectedPinNumber}
        list={RpiPinList(boundPins)} />
    </Col>
  </Row>;
};

/** binding type selection: sequence or action */
export const BindingTypeDropDown = (props: {
  bindingType: PinBindingType,
  setBindingType: (ddi: DropDownItem) => void,
}) => {
  const { bindingType, setBindingType } = props;
  return <FBSelect
    key={"binding_type_input_" + bindingType}
    onChange={setBindingType}
    selectedItem={{
      label: bindingTypeLabelLookup[bindingType],
      value: bindingType
    }}
    list={bindingTypeList()} />;
};

/** sequence selection */
export const SequenceTargetDropDown = (props: {
  sequenceIdInput: number | undefined,
  resources: ResourceIndex,
  setSequenceIdInput: (ddi: DropDownItem) => void,
}) => {
  const { sequenceIdInput, resources, setSequenceIdInput } = props;
  return <SequenceSelectBox
    key={sequenceIdInput}
    onChange={setSequenceIdInput}
    resources={resources}
    sequenceId={sequenceIdInput} />;
};

/** special action selection */
export const ActionTargetDropDown = (props: {
  specialActionInput: PinBindingSpecialAction | undefined,
  setSpecialAction: (ddi: DropDownItem) => void,
}) => {
  const { specialActionInput, setSpecialAction } = props;

  const selectedSpecialAction = specialActionInput ? {
    label: specialActionLabelLookup[specialActionInput || ""],
    value: "" + specialActionInput
  } : NULL_CHOICE;

  return <FBSelect
    key={"special_action_input_" + specialActionInput}
    onChange={setSpecialAction}
    selectedItem={selectedSpecialAction}
    list={specialActionList} />;
};
