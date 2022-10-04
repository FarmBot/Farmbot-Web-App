import React from "react";
import { t } from "../../i18next_wrapper";
import { Color } from "../../ui/colors";
import { FirmwareHardware, RpcRequestBodyItem, SyncStatus } from "farmbot";
import { hasExtraButtons } from "../firmware/firmware_hardware_support";
import { DropDownItem } from "../../ui";
import { BindingTargetDropdown, pinBindingLabel } from "./pin_binding_input_group";
import {
  PinBinding,
  PinBindingSpecialAction, PinBindingType, SpecialPinBinding, StandardPinBinding,
} from "farmbot/dist/resources/api_resources";
import { initSave, overwrite, save, destroy } from "../../api/crud";
import { pinBindingBody } from "./tagged_pin_binding_init";
import { ResourceIndex } from "../../resources/interfaces";
import { findByUuid } from "../../resources/reducer_support";
import { apiPinBindings } from "./pin_bindings_content";
import { execSequence, sendRPC } from "../../devices/actions";
import { cloneDeep, isUndefined } from "lodash";

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

const CIRCLES = ({ firmwareHardware, clean }: CirclesProps) => [
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
  syncStatus: SyncStatus | undefined;
  locked: boolean;
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
      const newBody = cloneDeep(binding.body as PinBinding);
      newBody.binding_type = bindingType;
      if (bindingType == PinBindingType.standard && sequenceIdInput) {
        (newBody as StandardPinBinding).sequence_id = sequenceIdInput;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newBody as any).special_action = undefined;
      }
      if (bindingType == PinBindingType.special && specialActionInput) {
        (newBody as SpecialPinBinding).special_action = specialActionInput;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newBody as any).sequence_id = undefined;
      }
      this.props.dispatch(overwrite(binding, newBody));
      this.props.dispatch(save(binding.uuid));
    } else {
      this.props.dispatch(initSave("PinBinding", body));
    }
  };

  render() {
    const { firmwareHardware, botOnline, locked, syncStatus } = this.props;
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
        {buttons.map(circle => {
          const { color } = circle;
          const statusProps = { botOnline, color, locked, syncStatus };
          const binding = this.findBinding(circle.pin);
          return <ButtonCircle key={circle.cx} {...circle}
            hover={this.hover}
            hovered={this.state.hoveredPin == circle.pin}
            on={ledOn(statusProps)}
            blinking={ledBlinking(statusProps)}
            hasBinding={!!binding}
            press={() => {
              const binding = this.findBinding(circle.pin);
              if (!botOnline || !binding) { return; }
              if (binding.sequence_id) {
                execSequence(binding.sequence_id);
              }
              if (binding.special_action) {
                sendRPC({
                  kind: binding.special_action, args: {},
                } as RpcRequestBodyItem);
              }
            }} />;
        })}
      </div>
      <div className={"box-top-leds"}>
        {leds.map(circle => <LEDCircle key={circle.cx} color={circle.color}
          on={botOnline} blinking={ledBlinking({
            botOnline, color: circle.color, locked, syncStatus,
          })} />)}
        {leds.map(circle => <p key={circle.cx}>{circle.label}</p>)}
      </div>
    </div>;
  }
}

interface LedOnProps {
  botOnline: boolean;
  locked: boolean;
  syncStatus: SyncStatus | undefined;
  color: Color;
}

const ledOn = (props: LedOnProps) => {
  if (!props.botOnline) { return false; }
  switch (props.color) {
    case Color.red: return !props.locked;
    default: return true;
  }
};

const ledBlinking = (props: LedOnProps) => {
  if (!props.botOnline) { return false; }
  switch (props.color) {
    case Color.yellow: return props.locked;
    case Color.green: return props.syncStatus == "syncing";
    default: return false;
  }
};

interface ButtonCircleProps {
  pin: number;
  color: Color;
  hover(hovered: number | undefined): () => void;
  hovered: boolean;
  press(): void;
  on: boolean;
  blinking: boolean;
  hasBinding: boolean;
}

const ButtonCircle = (props: ButtonCircleProps) => {
  const { pin, color, hasBinding } = props;
  const hovered = props.hovered;
  return <svg id={"box-top-gpio"}
    width={"100%"} height={"100%"} viewBox={"-10 -10 20 20"}
    style={{ maxHeight: "100px", maxWidth: "100px" }}>
    <g id={"button"} style={{ cursor: hasBinding ? "pointer" : "not-allowed" }}
      onMouseEnter={props.hover(pin)}
      onMouseLeave={props.hover(undefined)}
      onClick={() => props.press()}>
      <circle className={props.blinking ? "slow-blink" : ""}
        fill={color} fillOpacity={props.on ? 1 : 0.25} strokeWidth={2}
        stroke={hovered ? Color.darkGray : Color.gray}
        cx={0} cy={0} r={8} />
      <circle stroke={"none"}
        fill={hovered ? Color.darkGray : Color.gray}
        cx={0} cy={0} r={5} />
    </g>
  </svg>;
};

interface LEDCircleProps {
  color: Color;
  on: boolean;
  blinking: boolean;
}

const LEDCircle = (props: LEDCircleProps) => {
  const { color } = props;
  return <svg id={"box-top-gpio"}
    width={"100%"} height={"100%"} viewBox={"-10 -10 20 20"}
    style={{ maxHeight: "100px", maxWidth: "100px" }}>
    <g id={"button"}>
      <circle className={props.blinking ? "fast-blink" : ""}
        strokeWidth={3} stroke={Color.gray}
        fill={color} fillOpacity={props.on ? 1 : 0.25}
        cx={0} cy={0} r={4.5} />
    </g>
  </svg>;
};
