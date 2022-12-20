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
  specialActionList,
  reservedPiGPIO,
  getSpecialActionLabel,
} from "./list_and_label_support";
import {
  PinBindingType, PinBindingSpecialAction,
} from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";
import { DeviceSetting } from "../../constants";
import { BoxTopGpioDiagram } from "./box_top_gpio_diagram";
import { findSequenceById, selectAllSequences } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { FirmwareHardware } from "farmbot";

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

  Number = () =>
    <PinNumberInputGroup
      firmwareHardware={this.props.firmwareHardware}
      pinNumberInput={this.state.pinNumberInput}
      boundPins={this.boundPins}
      setSelectedPin={this.setSelectedPin} />;

  changeBinding = (ddi: DropDownItem) =>
    this.setState({
      bindingType: ddi.headingId as PinBindingType,
      sequenceIdInput: ddi.headingId == PinBindingType.standard
        ? parseInt("" + ddi.value)
        : undefined,
      specialActionInput: ddi.headingId == PinBindingType.special
        ? ddi.value as PinBindingSpecialAction
        : undefined,
    });

  render() {
    return <div className="pin-binding-input-rows">
      <Row><label>{t(DeviceSetting.addNewPinBinding)}</label></Row>
      <this.Number />
      <Row>
        <Col xs={12}>
          <BindingTargetDropdown
            change={this.changeBinding}
            resources={this.props.resources}
            sequenceIdInput={this.state.sequenceIdInput}
            specialActionInput={this.state.specialActionInput} />
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

export interface PinNumberInputGroupProps {
  pinNumberInput: number | undefined;
  boundPins: number[];
  setSelectedPin: (pin: number | undefined) => void;
  firmwareHardware: FirmwareHardware | undefined;
}

/** pin number selection */
export const PinNumberInputGroup = (props: PinNumberInputGroupProps) => {
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
          firmwareHardware={props.firmwareHardware}
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

export interface BindingTargetDropdownProps {
  resources: ResourceIndex;
  sequenceIdInput: number | undefined;
  specialActionInput: PinBindingSpecialAction | undefined;
  change(ddi: DropDownItem): void;
}

export const BindingTargetDropdown = (props: BindingTargetDropdownProps) => {
  const list = () => {
    const { resources } = props;
    const dropDownList: DropDownItem[] = [];

    dropDownList.push({ isNull: true, label: t("None"), value: "" });

    dropDownList.push({
      label: t("Actions"), value: 0,
      heading: true, headingId: PinBindingType.special,
    });
    specialActionList().map(ddi => dropDownList.push(ddi));

    dropDownList.push({
      label: t("Sequences"), value: 0,
      heading: true, headingId: PinBindingType.standard,
    });
    selectAllSequences(resources)
      .map(sequence => {
        const { id, name } = sequence.body;
        if (isNumber(id) && (id !== props.sequenceIdInput)) {
          dropDownList.push({
            label: name,
            value: id,
            headingId: PinBindingType.standard,
          });
        }
      });
    return dropDownList;
  };

  return <FBSelect
    onChange={props.change}
    selectedItem={pinBindingLabel(props)}
    list={list()}
    customNullLabel={t("Select an action")} />;
};

interface PinBindingLabelProps {
  resources: ResourceIndex;
  sequenceIdInput: number | undefined;
  specialActionInput: PinBindingSpecialAction | undefined;
}

export const pinBindingLabel = (props: PinBindingLabelProps) => {
  const { resources, sequenceIdInput, specialActionInput } = props;
  if (sequenceIdInput) {
    const { id, name } = findSequenceById(resources, sequenceIdInput).body;
    return { label: name, value: id as number };
  } else if (specialActionInput) {
    return {
      label: getSpecialActionLabel(specialActionInput),
      value: specialActionInput
    };
  } else {
    return undefined;
  }
};
