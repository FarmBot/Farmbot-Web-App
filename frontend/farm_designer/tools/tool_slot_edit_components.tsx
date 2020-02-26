import React from "react";
import { t } from "../../i18next_wrapper";
import { Xyz, TaggedTool, TaggedToolSlotPointer } from "farmbot";
import {
  Row, Col, BlurableInput, FBSelect, NULL_CHOICE, DropDownItem
} from "../../ui";
import { BotPosition } from "../../devices/interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { Popover } from "@blueprintjs/core";
import { ToolSlotSVG } from "../map/layers/tool_slots/tool_graphics";
import { BotOriginQuadrant } from "../interfaces";
import { isNumber } from "lodash";

export interface GantryMountedInputProps {
  gantryMounted: boolean;
  onChange(update: { gantry_mounted: boolean }): void;
}

export const GantryMountedInput = (props: GantryMountedInputProps) =>
  <fieldset className="gantry-mounted-input">
    <label>{t("Gantry-mounted")}</label>
    <input type="checkbox"
      onChange={() => props.onChange({ gantry_mounted: !props.gantryMounted })}
      checked={props.gantryMounted} />
  </fieldset>;

export interface SlotDirectionInputRowProps {
  toolPulloutDirection: ToolPulloutDirection;
  onChange(update: { pullout_direction: ToolPulloutDirection }): void;
}

export const SlotDirectionInputRow = (props: SlotDirectionInputRowProps) =>
  <fieldset className="tool-slot-direction-input">
    <label>
      {t("Change direction")}
    </label>
    <i className={"direction-icon "
      + directionIconClass(props.toolPulloutDirection)}
      onClick={() => props.onChange({
        pullout_direction: newSlotDirection(props.toolPulloutDirection)
      })} />
    <FBSelect
      key={props.toolPulloutDirection}
      list={DIRECTION_CHOICES}
      selectedItem={DIRECTION_CHOICES_DDI[props.toolPulloutDirection]}
      onChange={ddi => props.onChange({
        pullout_direction: parseInt("" + ddi.value)
      })} />
  </fieldset>;

export interface ToolSelectionProps {
  tools: TaggedTool[];
  selectedTool: TaggedTool | undefined;
  onChange(update: { tool_id: number }): void;
  filterSelectedTool: boolean;
  isActive(id: number | undefined): boolean;
  filterActiveTools: boolean;
}

export const ToolSelection = (props: ToolSelectionProps) =>
  <FBSelect
    list={([NULL_CHOICE] as DropDownItem[]).concat(props.tools
      .filter(tool => !props.filterSelectedTool
        || tool.body.id != props.selectedTool?.body.id)
      .filter(tool => !props.filterActiveTools
        || !props.isActive(tool.body.id))
      .map(tool => ({
        label: tool.body.name || "untitled",
        value: tool.body.id || 0,
      }))
      .filter(ddi => ddi.value > 0))}
    selectedItem={props.selectedTool
      ? {
        label: props.selectedTool.body.name || "untitled",
        value: "" + props.selectedTool.body.id
      } : NULL_CHOICE}
    onChange={ddi =>
      props.onChange({ tool_id: parseInt("" + ddi.value) })} />;

export interface ToolInputRowProps {
  tools: TaggedTool[];
  selectedTool: TaggedTool | undefined;
  onChange(update: { tool_id: number }): void;
  isExpress: boolean;
  isActive(id: number | undefined): boolean;
}

export const ToolInputRow = (props: ToolInputRowProps) =>
  <div className="tool-slot-tool-input">
    <Row>
      <Col xs={12}>
        <label>
          {props.isExpress
            ? t("Seed Container")
            : t("Tool or Seed Container")}
        </label>
        <ToolSelection
          tools={props.tools}
          selectedTool={props.selectedTool}
          onChange={props.onChange}
          isActive={props.isActive}
          filterSelectedTool={false}
          filterActiveTools={true} />
      </Col>
    </Row>
  </div>;

export interface SlotLocationInputRowProps {
  slotLocation: Record<Xyz, number>;
  gantryMounted: boolean;
  onChange(update: Partial<Record<Xyz, number>>): void;
  botPosition: BotPosition;
}

export const SlotLocationInputRow = (props: SlotLocationInputRowProps) =>
  <div className="tool-slot-location-input">
    <Row>
      <Col xs={11} className="axis-inputs">
        {["x", "y", "z"].map((axis: Xyz) =>
          <Col xs={4} key={axis}>
            <label>{t("{{axis}} (mm)", { axis })}</label>
            {axis == "x" && props.gantryMounted
              ? <input disabled value={t("Gantry")} />
              : <BlurableInput
                type="number"
                value={props.slotLocation[axis]}
                min={axis == "z" ? undefined : 0}
                onCommit={e => props.onChange({
                  [axis]: parseFloat(e.currentTarget.value)
                })} />}
          </Col>)}
      </Col>
      <Col xs={1} className="use-current-location">
        <Popover>
          <i className="fa fa-question-circle help-icon" />
          <div className="current-location-info">
            <label>{t("Use current location")}</label>
            <p>{positionButtonTitle(props.botPosition)}</p>
          </div>
        </Popover>
        <button
          className="blue fb-button"
          title={positionButtonTitle(props.botPosition)}
          onClick={() => positionIsDefined(props.botPosition) &&
            props.onChange(props.botPosition)}>
          <i className="fa fa-crosshairs" />
        </button>
      </Col>
    </Row>
  </div>;

export interface SlotEditRowsProps {
  toolSlot: TaggedToolSlotPointer;
  tools: TaggedTool[];
  tool: TaggedTool | undefined;
  botPosition: BotPosition;
  updateToolSlot(update: Partial<TaggedToolSlotPointer["body"]>): void;
  isExpress: boolean;
  xySwap: boolean;
  quadrant: BotOriginQuadrant;
  isActive(id: number | undefined): boolean;
}

export const SlotEditRows = (props: SlotEditRowsProps) =>
  <div className="tool-slot-edit-rows">
    <ToolSlotSVG toolSlot={props.toolSlot}
      toolName={props.tool ? props.tool.body.name : "Empty"}
      renderRotation={true} xySwap={props.xySwap} quadrant={props.quadrant} />
    <SlotLocationInputRow
      slotLocation={props.toolSlot.body}
      gantryMounted={props.toolSlot.body.gantry_mounted}
      botPosition={props.botPosition}
      onChange={props.updateToolSlot} />
    <ToolInputRow
      isExpress={props.isExpress}
      tools={props.tools}
      selectedTool={props.tool}
      isActive={props.isActive}
      onChange={props.updateToolSlot} />
    {!props.toolSlot.body.gantry_mounted &&
      <SlotDirectionInputRow
        toolPulloutDirection={props.toolSlot.body.pullout_direction}
        onChange={props.updateToolSlot} />}
    {!props.isExpress &&
      <GantryMountedInput
        gantryMounted={props.toolSlot.body.gantry_mounted}
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

export const positionButtonTitle = (position: BotPosition): string =>
  positionIsDefined(position)
    ? `(${position.x}, ${position.y}, ${position.z})`
    : t("(unknown)");

export const newSlotDirection =
  (old: ToolPulloutDirection | undefined): ToolPulloutDirection =>
    isNumber(old) && old < 4 ? old + 1 : ToolPulloutDirection.NONE;

export const positionIsDefined = (position: BotPosition): boolean =>
  isNumber(position.x) && isNumber(position.y) && isNumber(position.z);

export const DIRECTION_CHOICES_DDI: { [index: number]: DropDownItem } = {
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
};

export const DIRECTION_CHOICES: DropDownItem[] = [
  DIRECTION_CHOICES_DDI[ToolPulloutDirection.NONE],
  DIRECTION_CHOICES_DDI[ToolPulloutDirection.POSITIVE_X],
  DIRECTION_CHOICES_DDI[ToolPulloutDirection.NEGATIVE_X],
  DIRECTION_CHOICES_DDI[ToolPulloutDirection.POSITIVE_Y],
  DIRECTION_CHOICES_DDI[ToolPulloutDirection.NEGATIVE_Y],
];
