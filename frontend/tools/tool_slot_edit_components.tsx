import React from "react";
import { t } from "../i18next_wrapper";
import { Xyz } from "farmbot";
import {
  Row, Col, BlurableInput, FBSelect, NULL_CHOICE, DropDownItem, Popover,
} from "../ui";
import { BotPosition } from "../devices/interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { ToolSlotSVG } from "../farm_designer/map/layers/tool_slots/tool_graphics";
import { isNumber } from "lodash";
import {
  GantryMountedInputProps, SlotDirectionInputRowProps, ToolSelectionProps,
  ToolInputRowProps, SlotLocationInputRowProps, SlotEditRowsProps,
  EditToolSlotMetaProps,
} from "./interfaces";
import { betterMerge } from "../util";
import { GoToThisLocationButton } from "../farm_designer/move_to";

export const GantryMountedInput = (props: GantryMountedInputProps) =>
  <fieldset className="gantry-mounted-input">
    <label>{t("Gantry-mounted")}</label>
    <input type="checkbox" name="gantry_mounted"
      onChange={() => props.onChange({ gantry_mounted: !props.gantryMounted })}
      checked={props.gantryMounted} />
  </fieldset>;

export const isToolFlipped =
  (toolSlotMeta: Record<string, string | undefined> | undefined) =>
    !!toolSlotMeta?.tool_direction?.toLowerCase().includes("flipped");

export const FlipToolDirection = (props: EditToolSlotMetaProps) => {
  const { toolSlotMeta } = props;
  const value = isToolFlipped(toolSlotMeta);
  return <fieldset className="tool-direction-input">
    <label>{t("rotate tool 180 degrees")}</label>
    <input type="checkbox" name="tool_direction"
      onChange={() => {
        const tool_direction = value ? "standard" : "flipped";
        const meta = betterMerge(toolSlotMeta, { tool_direction });
        props.onChange({ meta });
      }}
      checked={value} />
  </fieldset>;
};

export const SlotDirectionInputRow = (props: SlotDirectionInputRowProps) => {
  const iconClass = directionIconClass(props.toolPulloutDirection);
  return <fieldset className="tool-slot-direction-input">
    <label>
      {t("slot direction")}
    </label>
    <i className={`direction-icon ${iconClass}`}
      onClick={() => props.onChange({
        pullout_direction: newSlotDirection(props.toolPulloutDirection)
      })} />
    <FBSelect
      key={props.toolPulloutDirection}
      list={DIRECTION_CHOICES()}
      selectedItem={DIRECTION_CHOICES_DDI()[props.toolPulloutDirection]}
      onChange={ddi => props.onChange({
        pullout_direction: parseInt("" + ddi.value)
      })} />
  </fieldset>;
};

export const ToolSelection = (props: ToolSelectionProps) =>
  <FBSelect
    list={([NULL_CHOICE] as DropDownItem[]).concat(props.tools
      .filter(tool => !props.filterSelectedTool
        || tool.body.id != props.selectedTool?.body.id)
      .filter(tool => !props.filterActiveTools
        || !props.isActive(tool.body.id))
      .filter(tool => props.noUTM
        ? tool.body.name?.toLowerCase().includes("trough")
        : true)
      .map(tool => ({
        label: tool.body.name || "untitled",
        value: tool.body.id || 0,
      }))
      .filter(ddi => ddi.value > 0))}
    selectedItem={props.selectedTool
      ? {
        label: props.selectedTool.body.name || "untitled",
        value: "" + props.selectedTool.body.id
      }
      : NULL_CHOICE}
    onChange={ddi =>
      props.onChange({ tool_id: parseInt("" + ddi.value) })} />;

export const ToolInputRow = (props: ToolInputRowProps) =>
  <div className="tool-slot-tool-input">
    <Row>
      <Col xs={12}>
        <label>
          {props.noUTM
            ? t("Seed Container")
            : t("Tool or Seed Container")}
        </label>
        <ToolSelection
          tools={props.tools}
          selectedTool={props.selectedTool}
          onChange={props.onChange}
          isActive={props.isActive}
          noUTM={props.noUTM}
          filterSelectedTool={false}
          filterActiveTools={true} />
      </Col>
    </Row>
  </div>;

export const SlotLocationInputRow = (props: SlotLocationInputRowProps) => {
  const x = props.gantryMounted
    ? props.botPosition.x ?? props.slotLocation.x
    : props.slotLocation.x;
  const { y, z } = props.slotLocation;
  return <div className="tool-slot-location-input">
    <Row>
      <Col xs={11} className="axis-inputs">
        {["x", "y", "z"].map((axis: Xyz) =>
          <Col xs={4} key={axis}>
            <label>{t("{{axis}} (mm)", { axis })}</label>
            {axis == "x" && props.gantryMounted
              ? <input disabled value={t("Gantry")} name={axis} />
              : <BlurableInput
                type="number"
                value={props.slotLocation[axis]}
                min={axis == "z" ? undefined : 0}
                onCommit={e => props.onChange({
                  [axis]: parseFloat(e.currentTarget.value)
                })} />}
          </Col>)}
      </Col>
      <UseCurrentLocation botPosition={props.botPosition}
        onChange={props.onChange} />
    </Row>
    <GoToThisLocationButton
      dispatch={props.dispatch}
      locationCoordinate={{ x, y, z }}
      botOnline={props.botOnline}
      arduinoBusy={props.arduinoBusy}
      currentBotLocation={props.botPosition}
      movementState={props.movementState}
      defaultAxes={props.defaultAxes} />
  </div>;
};

export interface UseCurrentLocationProps {
  botPosition: BotPosition;
  onChange(update: Record<Xyz, number>): void;
}

export const UseCurrentLocation = (props: UseCurrentLocationProps) =>
  <Col xs={1} className="use-current-location">
    <Popover
      target={<i className="fa fa-question-circle help-icon" />}
      content={<div className="current-location-info">
        <label>{t("Use current location")}</label>
        <p>{positionButtonTitle(props.botPosition)}</p>
      </div>} />
    <button
      className="blue fb-button"
      title={positionButtonTitle(props.botPosition)}
      onClick={() => {
        const position = definedPosition(props.botPosition);
        position && props.onChange(position);
      }}>
      <i className="fa fa-crosshairs" />
    </button>
  </Col>;

export const SlotEditRows = (props: SlotEditRowsProps) =>
  <div className="tool-slot-edit-rows">
    <ToolSlotSVG toolSlot={props.toolSlot} profile={true}
      toolName={props.tool ? props.tool.body.name : "Empty"}
      toolTransformProps={props.toolTransformProps} />
    <SlotLocationInputRow
      slotLocation={props.toolSlot.body}
      gantryMounted={props.toolSlot.body.gantry_mounted}
      botPosition={props.botPosition}
      movementState={props.movementState}
      botOnline={props.botOnline}
      dispatch={props.dispatch}
      arduinoBusy={props.arduinoBusy}
      defaultAxes={props.defaultAxes}
      onChange={props.updateToolSlot} />
    <ToolInputRow
      noUTM={props.noUTM}
      tools={props.tools}
      selectedTool={props.tool}
      isActive={props.isActive}
      onChange={props.updateToolSlot} />
    {!props.toolSlot.body.gantry_mounted &&
      <SlotDirectionInputRow
        toolPulloutDirection={props.toolSlot.body.pullout_direction}
        onChange={props.updateToolSlot} />}
    {!props.noUTM &&
      <GantryMountedInput
        gantryMounted={props.toolSlot.body.gantry_mounted}
        onChange={props.updateToolSlot} />}
    {!props.noUTM && !props.toolSlot.body.gantry_mounted &&
      <FlipToolDirection
        toolSlotMeta={props.toolSlot.body.meta}
        onChange={props.updateToolSlot} />}
  </div>;

const directionIconClass = (slotDirection: ToolPulloutDirection) => {
  switch (slotDirection) {
    case ToolPulloutDirection.POSITIVE_X: return "fa fa-arrow-circle-right";
    case ToolPulloutDirection.NEGATIVE_X: return "fa fa-arrow-circle-left";
    case ToolPulloutDirection.POSITIVE_Y: return "fa fa-arrow-circle-up";
    case ToolPulloutDirection.NEGATIVE_Y: return "fa fa-arrow-circle-down";
    case ToolPulloutDirection.NONE: return "fa fa-dot-circle-o";
  }
};

const positionButtonTitle = (botPosition: BotPosition): string => {
  const position = definedPosition(botPosition);
  return position
    ? `(${position.x}, ${position.y}, ${position.z})`
    : t("(unknown)");
};

const newSlotDirection =
  (old: ToolPulloutDirection | undefined): ToolPulloutDirection =>
    isNumber(old) && old < 4 ? old + 1 : ToolPulloutDirection.NONE;

export const definedPosition =
  (position: BotPosition): Record<Xyz, number> | undefined => {
    const { x, y, z } = position;
    return (isNumber(x) && isNumber(y) && isNumber(z))
      ? { x, y, z }
      : undefined;
  };

const DIRECTION_CHOICES_DDI = (): { [index: number]: DropDownItem } => ({
  [ToolPulloutDirection.NONE]:
    { label: t("None"), value: ToolPulloutDirection.NONE },
  [ToolPulloutDirection.POSITIVE_X]:
    { label: t("Positive X"), value: ToolPulloutDirection.POSITIVE_X },
  [ToolPulloutDirection.NEGATIVE_X]:
    { label: t("Negative X"), value: ToolPulloutDirection.NEGATIVE_X },
  [ToolPulloutDirection.POSITIVE_Y]:
    { label: t("Positive Y"), value: ToolPulloutDirection.POSITIVE_Y },
  [ToolPulloutDirection.NEGATIVE_Y]:
    { label: t("Negative Y"), value: ToolPulloutDirection.NEGATIVE_Y },
});

export const DIRECTION_CHOICES = (): DropDownItem[] => [
  DIRECTION_CHOICES_DDI()[ToolPulloutDirection.NONE],
  DIRECTION_CHOICES_DDI()[ToolPulloutDirection.POSITIVE_X],
  DIRECTION_CHOICES_DDI()[ToolPulloutDirection.NEGATIVE_X],
  DIRECTION_CHOICES_DDI()[ToolPulloutDirection.POSITIVE_Y],
  DIRECTION_CHOICES_DDI()[ToolPulloutDirection.NEGATIVE_Y],
];
