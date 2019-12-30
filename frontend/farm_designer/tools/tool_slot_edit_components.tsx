import React from "react";
import { t } from "../../i18next_wrapper";
import { Xyz, TaggedTool, TaggedToolSlotPointer } from "farmbot";
import { Row, Col, BlurableInput, FBSelect, NULL_CHOICE } from "../../ui";
import {
  directionIconClass, positionButtonTitle, newSlotDirection, positionIsDefined
} from "../../tools/components/toolbay_slot_menu";
import {
  DIRECTION_CHOICES, DIRECTION_CHOICES_DDI
} from "../../tools/components/toolbay_slot_direction_selection";
import { BotPosition } from "../../devices/interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";

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

export interface UseCurrentLocationInputRowProps {
  botPosition: BotPosition;
  onChange(botPosition: BotPosition): void;
}

export const UseCurrentLocationInputRow =
  (props: UseCurrentLocationInputRowProps) =>
    <fieldset className="use-current-location-input">
      <label>{t("Use current location")}</label>
      <button
        className="blue fb-button"
        title={positionButtonTitle(props.botPosition)}
        onClick={() => positionIsDefined(props.botPosition) &&
          props.onChange(props.botPosition)}>
        <i className="fa fa-crosshairs" />
      </button>
      <p>{positionButtonTitle(props.botPosition)}</p>
    </fieldset>;

export interface SlotDirectionInputRowProps {
  toolPulloutDirection: ToolPulloutDirection;
  onChange(update: { pullout_direction: ToolPulloutDirection }): void;
}

export const SlotDirectionInputRow = (props: SlotDirectionInputRowProps) =>
  <fieldset className="tool-slot-direction-input">
    <label>
      {t("Change slot direction")}
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
}

export const ToolSelection = (props: ToolSelectionProps) =>
  <FBSelect
    list={props.tools
      .filter(tool => (!props.filterSelectedTool || !props.selectedTool)
        || tool.body.id != props.selectedTool.body.id)
      .map(tool => ({
        label: tool.body.name || "untitled",
        value: tool.body.id || 0,
      }))
      .filter(ddi => ddi.value > 0)}
    selectedItem={props.selectedTool
      ? {
        label: props.selectedTool.body.name || "untitled",
        value: "" + props.selectedTool.body.id
      } : NULL_CHOICE}
    allowEmpty={true}
    onChange={ddi =>
      props.onChange({ tool_id: parseInt("" + ddi.value) })} />;

export interface ToolInputRowProps {
  tools: TaggedTool[];
  selectedTool: TaggedTool | undefined;
  onChange(update: { tool_id: number }): void;
}

export const ToolInputRow = (props: ToolInputRowProps) =>
  <div className="tool-slot-tool-input">
    <Row>
      <Col xs={12}>
        <label>{t("Tool")}</label>
        <ToolSelection
          tools={props.tools}
          selectedTool={props.selectedTool}
          onChange={props.onChange}
          filterSelectedTool={false} />
      </Col>
    </Row>
  </div>;

export interface SlotLocationInputRowProps {
  slotLocation: Record<Xyz, number>;
  gantryMounted: boolean;
  onChange(update: Partial<Record<Xyz, number>>): void;
}

export const SlotLocationInputRow = (props: SlotLocationInputRowProps) =>
  <div className="tool-slot-location-input">
    <Row>
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
    </Row>
  </div>;

export interface SlotEditRowsProps {
  toolSlot: TaggedToolSlotPointer;
  tools: TaggedTool[];
  tool: TaggedTool | undefined;
  botPosition: BotPosition;
  updateToolSlot(update: Partial<TaggedToolSlotPointer["body"]>): void;
}

export const SlotEditRows = (props: SlotEditRowsProps) =>
  <div className="tool-slot-edit-rows">
    <SlotLocationInputRow
      slotLocation={props.toolSlot.body}
      gantryMounted={props.toolSlot.body.gantry_mounted}
      onChange={props.updateToolSlot} />
    <ToolInputRow
      tools={props.tools}
      selectedTool={props.tool}
      onChange={props.updateToolSlot} />
    <SlotDirectionInputRow
      toolPulloutDirection={props.toolSlot.body.pullout_direction}
      onChange={props.updateToolSlot} />
    <UseCurrentLocationInputRow
      botPosition={props.botPosition}
      onChange={props.updateToolSlot} />
    <GantryMountedInput
      gantryMounted={props.toolSlot.body.gantry_mounted}
      onChange={props.updateToolSlot} />
  </div>;
