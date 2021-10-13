import React from "react";
import { Row, Col, FBSelect, DropDownItem, Popover } from "../../ui";
import { Position } from "@blueprintjs/core";
import { RpiGpioDiagram } from "./rpi_gpio_diagram";
import {
  PinBindingInputGroupProps,
  PinBindingInputGroupState,
} from "./interfaces";
import { isNumber, includes } from "lodash";
import { initSave } from "../../api/crud";
import { pinBindingBody } from "./tagged_pin_binding_init";
import { error, warning } from "../../toast/toast";
import {
  validGpioPins, sysBindings, generatePinLabel, RpiPinList,
  bindingTypeLabelLookup, specialActionList,
  reservedPiGPIO,
  bindingTypeList,
  getSpecialActionLabel,
} from "./list_and_label_support";
import { SequenceSelectBox } from "../../sequences/sequence_select_box";
import { ResourceIndex } from "../../resources/interfaces";
import {
  PinBindingType, PinBindingSpecialAction,
} from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";
import { DeviceSetting } from "../../constants";
import { BoxTopGpioDiagram } from "./box_top_gpio_diagram";

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
  };

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
  };

  setBindingType = (ddi: { label: string, value: PinBindingType }) =>
    this.setState({
      bindingType: ddi.value,
      sequenceIdInput: undefined,
      specialActionInput: undefined
    });

  setSequenceIdInput = (ddi: DropDownItem) =>
    this.setState({ sequenceIdInput: parseInt("" + ddi.value) });

  setSpecialAction =
    (ddi: { label: string, value: PinBindingSpecialAction }) =>
      this.setState({ specialActionInput: ddi.value });

  Number = () =>
    <PinNumberInputGroup
      pinNumberInput={this.state.pinNumberInput}
      boundPins={this.boundPins}
      setSelectedPin={this.setSelectedPin} />;

  Type = () =>
    <BindingTypeDropDown
      bindingType={this.state.bindingType}
      setBindingType={this.setBindingType} />;

  Action = () =>
    this.state.bindingType == PinBindingType.special
      ? <ActionTargetDropDown
        specialActionInput={this.state.specialActionInput}
        setSpecialAction={this.setSpecialAction} />
      : <SequenceTargetDropDown
        sequenceIdInput={this.state.sequenceIdInput}
        resources={this.props.resources}
        setSequenceIdInput={this.setSequenceIdInput} />;

  render() {
    return <div className="pin-binding-input-rows">
      <Row><label>{t(DeviceSetting.addNewPinBinding)}</label></Row>
      <this.Number />
      <Row>
        <Col xs={5}>
          <this.Type />
        </Col>
        <Col xs={7}>
          <this.Action />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <button
            className="fb-button green"
            type="button"
            title={t("BIND")}
            onClick={this.bindPin}>
            {t("Save")}
          </button>
        </Col>
      </Row>
    </div>;
  }
}

/** pin number selection */
export const PinNumberInputGroup = (props: {
  pinNumberInput: number | undefined,
  boundPins: number[],
  setSelectedPin: (pin: number | undefined) => void
}) => {
  const { pinNumberInput, boundPins, setSelectedPin } = props;
  const selectedPinNumber = isNumber(pinNumberInput)
    ? {
      label: generatePinLabel(pinNumberInput),
      value: "" + pinNumberInput
    }
    : undefined;
  return <Row>
    <Col xs={1}>
      <Popover position={Position.TOP}
        target={<i className="fa fa-circle-o-notch" />}
        content={<BoxTopGpioDiagram
          boundPins={boundPins}
          setSelectedPin={setSelectedPin}
          selectedPin={pinNumberInput} />} />
    </Col>
    <Col xs={1}>
      <Popover position={Position.TOP}
        target={<i className="fa fa-th-large" />}
        content={<RpiGpioDiagram
          boundPins={boundPins}
          setSelectedPin={setSelectedPin}
          selectedPin={pinNumberInput} />} />
    </Col>
    <Col xs={10}>
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
  return <FBSelect extraClass={"binding-type-dropdown"}
    key={"binding_type_input_" + bindingType}
    onChange={setBindingType}
    selectedItem={{
      label: bindingTypeLabelLookup()[bindingType],
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

  const selectedSpecialAction = specialActionInput
    ? {
      label: getSpecialActionLabel(specialActionInput),
      value: "" + specialActionInput
    }
    : undefined;

  return <FBSelect
    key={"special_action_input_" + specialActionInput}
    customNullLabel={t("Select an action")}
    onChange={setSpecialAction}
    selectedItem={selectedSpecialAction}
    list={specialActionList()} />;
};
