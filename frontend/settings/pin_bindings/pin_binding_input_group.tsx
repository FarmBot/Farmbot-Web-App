import React from "react";
import { Row, FBSelect, DropDownItem, Popover } from "../../ui";
import { Position } from "@blueprintjs/core";
import { RpiGpioDiagram } from "./rpi_gpio_diagram";
import {
  PinBindingInputGroupProps,
  PinBindingInputGroupState,
} from "./interfaces";
import { isNumber, includes } from "lodash";
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
import { setPinBinding } from "./actions";

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
    const { dispatch, resources } = this.props;
    const {
      pinNumberInput, sequenceIdInput, bindingType, specialActionInput
    } = this.state;
    const success = setPinBinding({
      binding: undefined,
      dispatch,
      resources,
      pinNumber: pinNumberInput,
    })({
      headingId: bindingType, label: "",
      value: "" + (sequenceIdInput || specialActionInput),
    });
    if (success) {
      this.setState({
        pinNumberInput: undefined,
        sequenceIdInput: undefined,
        specialActionInput: undefined,
        bindingType: PinBindingType.standard,
      });
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
    return <div className="grid">
      <Row><label>{t(DeviceSetting.addNewPinBinding)}</label></Row>
      <div className="row grid-exp-2">
        <this.Number />
        <BindingTargetDropdown
          change={this.changeBinding}
          resources={this.props.resources}
          sequenceIdInput={this.state.sequenceIdInput}
          specialActionInput={this.state.specialActionInput} />
        <button
          className="fb-button green"
          type="button"
          title={t("BIND")}
          onClick={this.bindPin}>
          {t("Save")}
        </button>
      </div>
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
  return <Row className="grid-exp-3">
    <Popover position={Position.TOP}
      target={<i className="fa fa-circle-o-notch" />}
      content={<BoxTopGpioDiagram
        firmwareHardware={props.firmwareHardware}
        boundPins={boundPins}
        setSelectedPin={setSelectedPin}
        selectedPin={pinNumberInput} />} />
    <Popover position={Position.TOP}
      target={<i className="fa fa-th-large" />}
      content={<RpiGpioDiagram
        boundPins={boundPins}
        setSelectedPin={setSelectedPin}
        selectedPin={pinNumberInput} />} />
    <FBSelect
      key={"pin_number_input_" + pinNumberInput}
      onChange={ddi =>
        setSelectedPin(parseInt("" + ddi.value))}
      selectedItem={selectedPinNumber}
      list={RpiPinList(boundPins)} />
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
  const selectedItem = pinBindingLabel(props);
  return <FBSelect
    key={JSON.stringify(selectedItem)}
    onChange={props.change}
    selectedItem={selectedItem}
    list={list()}
    customNullLabel={t("Select")} />;
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
