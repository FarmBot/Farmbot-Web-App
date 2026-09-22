import React from "react";
import { t } from "../i18next_wrapper";
import { TaggedToolSlotPointer, Xyz } from "farmbot";
import {
  Row, BlurableInput, FBSelect, NULL_CHOICE, DropDownItem, Popover,
} from "../ui";
import { BotPosition } from "../devices/interfaces";
import {
  MountStage, ToolPulloutDirection,
} from "farmbot/dist/resources/api_resources";
import { ToolSlotSVG } from "../farm_designer/map/layers/tool_slots/tool_graphics";
import { isNumber } from "lodash";
import {
  MountOffsetInputProps, MountStageInputProps, SlotDirectionInputRowProps,
  ToolSelectionProps,
  ToolInputRowProps, SlotLocationInputRowProps, SlotEditRowsProps,
  EditToolSlotMetaProps,
} from "./interfaces";
import { betterMerge } from "../util";
import { GoToThisLocationButton } from "../farm_designer/move_to";
import { XYZ } from "../devices/constants";
import {
  axisIsMounted, MOUNT_STAGE_CHOICES, mountStageLabel, resolveMountPosition,
} from "./mount_stage";

const mountOffsetUpdate = (
  axis: Xyz,
  value: number,
): Partial<Pick<TaggedToolSlotPointer["body"],
  "mount_offset_x" | "mount_offset_y" | "mount_offset_z">> => {
  switch (axis) {
    case "x": return { mount_offset_x: value };
    case "y": return { mount_offset_y: value };
    case "z": return { mount_offset_z: value };
  }
};

export const MountStageInput = (props: MountStageInputProps) =>
  <fieldset className="row grid-exp-1">
    <label>{t("Mount stage")}</label>
    <FBSelect
      key={props.mountStage}
      list={MOUNT_STAGE_CHOICES()}
      selectedItem={MOUNT_STAGE_CHOICES().find(choice =>
        choice.value == props.mountStage)}
      onChange={ddi => props.onChange({
        mount_stage: parseInt("" + ddi.value),
      })} />
  </fieldset>;

export const MountOffsetInput = (props: MountOffsetInputProps) =>
  props.mountStage == MountStage.NONE
    ? <></>
    : <div className={"mount-offset-input row grid-4-col"}>
      <label>{t("Mount offset")}</label>
      {XYZ.map(axis =>
        <div key={axis}>
          <label>{t("{{axis}} (mm)", { axis: axis.toUpperCase() })}</label>
          <BlurableInput
            name={`mountOffset${axis.toUpperCase()}`}
            value={props.value[axis]}
            disabled={!axisIsMounted(props.mountStage, axis)}
            type={"number"}
            onCommit={e => props.onChange(mountOffsetUpdate(
              axis, parseFloat(e.currentTarget.value)))} />
        </div>)}
    </div>;

export const isToolFlipped =
  (toolSlotMeta: Record<string, string | undefined> | undefined) =>
    !!toolSlotMeta?.tool_direction?.toLowerCase().includes("flipped");

export const FlipToolDirection = (props: EditToolSlotMetaProps) => {
  const { toolSlotMeta } = props;
  const value = isToolFlipped(toolSlotMeta);
  return <fieldset className="row grid-exp-1">
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
  return <fieldset>
    <Row className="grid-2-col">
      <div>
        <label>
          {t("slot direction")}
        </label>
        <i className={`direction-icon ${iconClass} fb-icon-button invert`}
          onClick={() => props.onChange({
            pullout_direction: newSlotDirection(props.toolPulloutDirection)
          })} />
      </div>
      <FBSelect
        key={props.toolPulloutDirection}
        list={DIRECTION_CHOICES()}
        selectedItem={DIRECTION_CHOICES_DDI()[props.toolPulloutDirection]}
        onChange={ddi => props.onChange({
          pullout_direction: parseInt("" + ddi.value)
        })} />
    </Row>
  </fieldset>;
};

export const ToolSelection = (props: ToolSelectionProps) =>
  <FBSelect
    usePortal={props.usePortal}
    list={([NULL_CHOICE] as DropDownItem[]).concat(props.tools
      .filter(tool => !props.filterSelectedTool
        || tool.body.id != props.selectedTool?.body.id)
      .filter(tool => !props.filterActiveTools
        || !props.isActive(tool.body.id))
      .filter(tool => !props.filterUtmMountable
        || tool.body.utm_mountable)
      .filter(tool => props.noUTM
        ? tool.body.type == "seed_trough"
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
    <Row className="grid-2-col">
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
        usePortal={false}
        filterSelectedTool={false}
        filterActiveTools={true}
        filterUtmMountable={false} />
    </Row>
  </div>;

export const SlotLocationInputRow = (props: SlotLocationInputRowProps) => {
  const position = resolveMountPosition(
    props.slotLocation, props.botPosition, props.mountStage);
  return <div className="tool-slot-location-input">
    <Row className="tool-slot-location-grid">
      {XYZ.map((axis: Xyz) =>
        <div key={axis}>
          <label>{t("{{axis}} (mm)", { axis })}</label>
          {axisIsMounted(props.mountStage, axis)
            ? <input disabled value={mountStageLabel(props.mountStage)}
              name={axis} />
            : <BlurableInput
              type="number"
              value={props.slotLocation[axis]}
              min={axis == "z" ? undefined : 0}
              onCommit={e => props.onChange({
                [axis]: parseFloat(e.currentTarget.value)
              })} />}
        </div>)}
      <UseCurrentLocation botPosition={props.botPosition}
        onChange={props.onChange} />
      {props.dispatch != undefined
        && props.botOnline != undefined
        && props.arduinoBusy != undefined
        && props.defaultAxes != undefined
        && props.movementState != undefined &&
        <GoToThisLocationButton
          dispatch={props.dispatch}
          locationCoordinate={position}
          botOnline={props.botOnline}
          arduinoBusy={props.arduinoBusy}
          currentBotLocation={props.botPosition}
          movementState={props.movementState}
          defaultAxes={props.defaultAxes} />}
    </Row>
  </div>;
};

export interface UseCurrentLocationProps {
  botPosition: BotPosition;
  onChange(update: Record<Xyz, number>): void;
}

export const UseCurrentLocation = (props: UseCurrentLocationProps) =>
  <div className="grid">
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
  </div>;

export const SlotEditRows = (props: SlotEditRowsProps) =>
  <div className="grid">
    <ToolSlotSVG toolSlot={props.toolSlot} profile={true}
      toolName={props.tool ? props.tool.body.name : "Empty"}
      toolType={props.tool?.body.type}
      toolTransformProps={props.toolTransformProps} />
    <SlotLocationInputRow
      slotLocation={props.toolSlot.body}
      mountStage={props.toolSlot.body.mount_stage}
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
    <SlotDirectionInputRow
      toolPulloutDirection={props.toolSlot.body.pullout_direction}
      onChange={props.updateToolSlot} />
    {!props.noUTM &&
      <MountStageInput
        mountStage={props.toolSlot.body.mount_stage}
        onChange={props.updateToolSlot} />}
    <MountOffsetInput
      mountStage={props.toolSlot.body.mount_stage}
      value={{
        x: props.toolSlot.body.mount_offset_x ?? 0,
        y: props.toolSlot.body.mount_offset_y ?? 0,
        z: props.toolSlot.body.mount_offset_z ?? 0,
      }}
      onChange={props.updateToolSlot} />
    {!props.noUTM &&
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
