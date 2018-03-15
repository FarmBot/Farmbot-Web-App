import * as React from "react";
import { t } from "i18next";
import { isNumber } from "lodash";
import { BotPosition } from "../../devices/interfaces";
import { TaggedToolSlotPointer } from "../../resources/tagged_resources";
import { ToolPulloutDirection } from "../../interfaces";
import { edit } from "../../api/crud";
import { SlotDirectionSelect } from "./toolbay_slot_direction_selection";

const positionIsDefined = (position: BotPosition): boolean => {
  return isNumber(position.x) && isNumber(position.y) && isNumber(position.z);
};

const useCurrentPosition = (
  dispatch: Function, slot: TaggedToolSlotPointer, position: BotPosition) => {
  if (positionIsDefined(position)) {
    dispatch(edit(slot, { x: position.x, y: position.y, z: position.z }));
  }
};

const positionButtonTitle = (position: BotPosition): string => {
  if (positionIsDefined(position)) {
    return `(${position.x}, ${position.y}, ${position.z})`;
  } else {
    return t("(unknown)");
  }
};

const changePulloutDirection =
  (dispatch: Function, slot: TaggedToolSlotPointer) => () => {
    const newDirection = (
      old: ToolPulloutDirection | undefined): ToolPulloutDirection => {
      if (isNumber(old) && old < 4) { return old + 1; }
      return ToolPulloutDirection.NONE;
    };
    dispatch(edit(slot,
      { pullout_direction: newDirection(slot.body.pullout_direction) }));
  };

const directionIconClass = (slotDirection: ToolPulloutDirection) => {
  switch (slotDirection) {
    case ToolPulloutDirection.POSITIVE_X: return "fa fa-arrow-circle-right";
    case ToolPulloutDirection.NEGATIVE_X: return "fa fa-arrow-circle-left";
    case ToolPulloutDirection.POSITIVE_Y: return "fa fa-arrow-circle-up";
    case ToolPulloutDirection.NEGATIVE_Y: return "fa fa-arrow-circle-down";
    case ToolPulloutDirection.NONE: return "fa fa-dot-circle-o";
  }
};

export interface SlotMenuProps {
  dispatch: Function,
  slot: TaggedToolSlotPointer,
  botPosition: BotPosition
}

export const SlotMenu = (props: SlotMenuProps) => {
  const { dispatch, slot, botPosition } = props;
  const { pullout_direction } = slot.body;
  return <div className="toolbay-slot-menu">
    <fieldset>
      <label>
        {t("Change slot direction")}
      </label>
      <i className={"direction-icon " +
        directionIconClass(pullout_direction)}
        onClick={
          changePulloutDirection(dispatch, slot)} />
      <SlotDirectionSelect
        key={pullout_direction}
        dispatch={dispatch}
        slot={slot} />
    </fieldset>
    <fieldset>
      <label>
        {t("Use current location")}
      </label>
      <button
        className="blue fb-button"
        title={positionButtonTitle(botPosition)}
        onClick={() =>
          useCurrentPosition(dispatch, slot, botPosition)}>
        <i className="fa fa-crosshairs" />
      </button>
      <p>
        {positionButtonTitle(botPosition)}
      </p>
    </fieldset>
  </div>;
};
