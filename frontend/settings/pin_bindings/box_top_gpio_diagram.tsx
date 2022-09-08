import React from "react";
import { t } from "../../i18next_wrapper";
import { Color } from "../../ui/colors";
import { FirmwareHardware, RpcRequestBodyItem } from "farmbot";
import { hasExtraButtons } from "../firmware/firmware_hardware_support";
import { DropDownItem } from "../../ui";
import { BindingTargetDropdown, pinBindingLabel } from "./pin_binding_input_group";
import {
  PinBindingSpecialAction, PinBindingType,
} from "farmbot/dist/resources/api_resources";
import { initSave, edit, save, destroy } from "../../api/crud";
import { pinBindingBody } from "./tagged_pin_binding_init";
import { ResourceIndex } from "../../resources/interfaces";
import { findByUuid } from "../../resources/reducer_support";
import { apiPinBindings } from "./pin_bindings_content";
import { execSequence, sendRPC } from "../../devices/actions";
import { isUndefined } from "lodash";

export interface BoxTopGpioDiagramProps {
  boundPins: number[] | undefined;
  setSelectedPin(pin: number | undefined): void;
  selectedPin: number | undefined;
  firmwareHardware: FirmwareHardware | undefined;
}

interface BoxTopGpioDiagramState {
  hoveredPin: number | undefined;
}

interface CirclesProps {
  firmwareHardware: FirmwareHardware | undefined;
  clean: boolean;
}

export const CIRCLES = ({ firmwareHardware, clean }: CirclesProps) => [
  ...(hasExtraButtons(firmwareHardware)
    ? [{ cx: 20, cy: 20, r: 7, pin: 20, label: t("Button 5"), color: Color.white }]
    : []),
  ...(hasExtraButtons(firmwareHardware)
    ? [{ cx: 40, cy: 20, r: 7, pin: 5, label: t("Button 4"), color: Color.white }]
    : []),
  ...(hasExtraButtons(firmwareHardware)
    ? [{ cx: 60, cy: 20, r: 7, pin: 26, label: t("Button 3"), color: Color.white }]
    : []),
  ...(hasExtraButtons(firmwareHardware) || !clean
    ? [{ cx: 80, cy: 20, r: 7, pin: 22, label: t("Button 2"), color: Color.yellow }]
    : []),
  { cx: 100, cy: 20, r: 7, pin: 16, label: t("Button 1"), color: Color.red },
  ...(hasExtraButtons(firmwareHardware)
    ? [{ cx: 30, cy: 38, r: 4, pin: 0, label: t("LED 4"), color: Color.white }]
    : []),
  ...(hasExtraButtons(firmwareHardware)
    ? [{ cx: 50, cy: 38, r: 4, pin: 0, label: t("LED 3"), color: Color.white }]
    : []),
  ...(hasExtraButtons(firmwareHardware) || !clean
    ? [{ cx: 70, cy: 38, r: 4, pin: 0, label: t("Connection"), color: Color.blue }]
    : []),
  ...(hasExtraButtons(firmwareHardware) || !clean
    ? [{ cx: 90, cy: 38, r: 4, pin: 0, label: t("Sync LED"), color: Color.green }]
    : []),
];

interface ButtonProps {
  cx: number;
  cy: number;
  r: number;
  pin: number;
  label: string;
  color: Color;
  hover(hovered: number | undefined): () => void;
  hovered: boolean;
  bound: boolean;
  setSelectedPin(pin: number | undefined): void;
}

const Button = (props: ButtonProps) => {
  const { pin, color, cx, cy, r } = props;
  const hovered = props.hovered && !props.bound;
  return <g id={"button"} style={{ cursor: "pointer" }}
    onMouseEnter={props.hover(pin)}
    onMouseLeave={props.hover(undefined)}
    onClick={() => pin && props.setSelectedPin(pin)}>
    <text x={cx} y={r > 4 ? 5 : 50}
      textAnchor={"middle"} fontSize={3}
      fontWeight={hovered ? "bold" : "normal"}>
      {props.label}
    </text>
    {r > 4 &&
      <text x={cx} y={8} textAnchor={"middle"} fontSize={2}>
        {props.bound ? t("IN USE") : t("AVAILABLE")}
      </text>}
    <circle fill={"none"} strokeWidth={4}
      stroke={hovered ? Color.darkGray : Color.gray}
      cx={cx} cy={cy} r={r} />
    {r > 4
      ? <circle fill={hovered ? Color.darkGray : Color.gray}
        strokeWidth={2} stroke={color}
        cx={cx} cy={cy} r={r - 1} />
      : <circle fill={color} strokeWidth={0}
        cx={cx} cy={cy} r={r - 1} />}
  </g>;
};

export class BoxTopGpioDiagram
  extends React.Component<BoxTopGpioDiagramProps, BoxTopGpioDiagramState> {
  state: BoxTopGpioDiagramState = { hoveredPin: undefined };

  hover = (hovered: number | undefined) =>
    () => hovered && this.setState({ hoveredPin: hovered });

  render() {
    const { firmwareHardware } = this.props;
    return <svg id={"box-top-gpio"}
      width={"100%"} height={"100%"} viewBox={"0 0 120 52"}
      style={{ maxHeight: "300px", maxWidth: "500px" }}>
      {CIRCLES({ firmwareHardware, clean: false }).map(circle =>
        <Button key={circle.cx}
          cx={circle.cx} cy={circle.cy} r={circle.r} color={circle.color}
          hover={this.hover} hovered={(this.state.hoveredPin == circle.pin)
            || (this.props.selectedPin == circle.pin)}
          pin={circle.pin} label={circle.label}
          bound={!!this.props.boundPins?.includes(circle.pin)}
          setSelectedPin={this.props.setSelectedPin} />)}
    </svg>;
  }
}

export interface BoxTopButtonsProps {
  firmwareHardware: FirmwareHardware | undefined;
  isEditing: boolean;
  dispatch: Function;
  resources: ResourceIndex;
  botOnline: boolean;
}

interface BoxTopButtonsState {
  hoveredPin: number | undefined;
}

export class BoxTopButtons
  extends React.Component<BoxTopButtonsProps, BoxTopButtonsState> {
  state: BoxTopGpioDiagramState = { hoveredPin: undefined };

  hover = (hovered: number | undefined) =>
    () => {
      if (isUndefined(hovered)) {
        this.setState({ hoveredPin: undefined });
        return;
      }
      hovered && this.props.botOnline && this.findBinding(hovered) &&
        this.setState({ hoveredPin: hovered });
    };

  findBinding = (pin: number) => apiPinBindings(this.props.resources)
    .filter(b => b.pin_number == pin)[0];

  bind = (pin: number) => (ddi: DropDownItem) => {
    const bindingUuid = this.findBinding(pin)?.uuid;
    if (bindingUuid && ddi.isNull) {
      this.props.dispatch(destroy(bindingUuid));
      return;
    }
    const bindingType = ddi.headingId as PinBindingType;
    const sequenceIdInput = ddi.headingId == PinBindingType.standard
      ? parseInt("" + ddi.value)
      : undefined;
    const specialActionInput = ddi.headingId == PinBindingType.special
      ? ddi.value as PinBindingSpecialAction
      : undefined;
    const body = pinBindingBody(bindingType == PinBindingType.special
      ? {
        pin_num: pin,
        special_action: specialActionInput,
        binding_type: bindingType
      }
      : {
        pin_num: pin,
        sequence_id: sequenceIdInput,
        binding_type: bindingType
      });
    if (bindingUuid) {
      const binding = findByUuid(this.props.resources, bindingUuid);
      this.props.dispatch(edit(binding, body));
      this.props.dispatch(save(binding.uuid));
    } else {
      this.props.dispatch(initSave("PinBinding", body));
    }
  };

  render() {
    const { firmwareHardware } = this.props;
    const circlesProps = { firmwareHardware, clean: true };
    const buttons = CIRCLES(circlesProps).filter(circle => circle.r > 4);
    const leds = CIRCLES(circlesProps).filter(circle => circle.r < 5);
    return <div className={"box-top-wrapper"}>
      <div className={"box-top-buttons"}
        style={hasExtraButtons(firmwareHardware) ? {} : { display: "block" }}>
        {buttons.map(circle => {
          const binding = this.findBinding(circle.pin);
          return this.props.isEditing && [5, 20, 26].includes(circle.pin)
            ? <BindingTargetDropdown key={circle.cx}
              change={this.bind(circle.pin)}
              resources={this.props.resources}
              sequenceIdInput={binding?.sequence_id}
              specialActionInput={binding?.special_action} />
            : <p key={circle.cx}>
              {(pinBindingLabel({
                resources: this.props.resources,
                sequenceIdInput: binding?.sequence_id,
                specialActionInput: binding?.special_action,
              }) || circle).label}
            </p>;
        })}
        {buttons.map(circle => <ButtonCircle key={circle.cx} {...circle}
          hover={this.hover}
          hovered={this.state.hoveredPin == circle.pin}
          press={() => {
            const binding = this.findBinding(circle.pin);
            if (!this.props.botOnline || !binding) { return; }
            if (binding.sequence_id) {
              execSequence(binding.sequence_id);
            }
            if (binding.special_action) {
              sendRPC({
                kind: binding.special_action, args: {},
              } as RpcRequestBodyItem);
            }
          }} />)}
      </div>
      <div className={"box-top-leds"}>
        {leds.map(circle => <LEDCircle key={circle.cx} color={circle.color} />)}
        {leds.map(circle => <p key={circle.cx}>{circle.label}</p>)}
      </div>
    </div>;
  }
}

interface ButtonCircleProps {
  pin: number;
  color: Color;
  hover(hovered: number | undefined): () => void;
  hovered: boolean;
  press(): void;
}

const ButtonCircle = (props: ButtonCircleProps) => {
  const { pin, color } = props;
  const hovered = props.hovered;
  return <svg id={"box-top-gpio"}
    width={"100%"} height={"100%"} viewBox={"-10 -10 20 20"}
    style={{ maxHeight: "100px", maxWidth: "100px" }}>
    <g id={"button"} style={{ cursor: "pointer" }}
      onMouseEnter={props.hover(pin)}
      onMouseLeave={props.hover(undefined)}
      onClick={() => props.press()}>
      <circle fill={"none"} strokeWidth={4}
        stroke={hovered ? Color.darkGray : Color.gray}
        cx={0} cy={0} r={7} />
      <circle fill={hovered ? Color.darkGray : Color.gray}
        strokeWidth={2} stroke={color}
        cx={0} cy={0} r={7 - 1} />
    </g>
  </svg>;
};

interface LEDCircleProps {
  color: Color;
}

const LEDCircle = (props: LEDCircleProps) => {
  const { color } = props;
  return <svg id={"box-top-gpio"}
    width={"100%"} height={"100%"} viewBox={"-10 -10 20 20"}
    style={{ maxHeight: "100px", maxWidth: "100px" }}>
    <g id={"button"}>
      <circle fill={"none"} strokeWidth={4}
        stroke={Color.gray}
        cx={0} cy={0} r={4} />
      <circle fill={color} strokeWidth={0}
        cx={0} cy={0} r={4 - 1} />
    </g>
  </svg>;
};
