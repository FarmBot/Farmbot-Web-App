import * as React from "react";

import { isNumber } from "lodash";
import { BotPosition } from "../../devices/interfaces";
import { TaggedToolSlotPointer } from "farmbot";
import { edit } from "../../api/crud";
import { SlotDirectionSelect } from "./toolbay_slot_direction_selection";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { t } from "../../i18next_wrapper";

const positionIsDefined = (position: BotPosition): boolean =>
  isNumber(position.x) && isNumber(position.y) && isNumber(position.z);

const useCurrentPosition = (
  dispatch: Function, slot: TaggedToolSlotPointer, position: BotPosition) => {
  if (positionIsDefined(position)) {
    dispatch(edit(slot, { x: position.x, y: position.y, z: position.z }));
  }
};

const positionButtonTitle = (position: BotPosition): string =>
  positionIsDefined(position)
    ? `(${position.x}, ${position.y}, ${position.z})`
    : t("(unknown)");

const changePulloutDirection =
  (dispatch: Function, slot: TaggedToolSlotPointer) => () => {
    const newDirection =
      (old: ToolPulloutDirection | undefined): ToolPulloutDirection =>
        isNumber(old) && old < 4 ? old + 1 : ToolPulloutDirection.NONE;
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
  const { pullout_direction, gantry_mounted } = slot.body;
  return <div className="toolbay-slot-menu">
    <fieldset>
      <label>
        {t("Change slot direction")}
      </label>
      <i className={"direction-icon " + directionIconClass(pullout_direction)}
        onClick={changePulloutDirection(dispatch, slot)} />
      <SlotDirectionSelect
        key={pullout_direction}
        dispatch={dispatch}
        slot={slot} />
    </fieldset>
    <fieldset>
      <label>{t("Use current location")}</label>
      <button
        className="blue fb-button"
        title={positionButtonTitle(botPosition)}
        onClick={() => useCurrentPosition(dispatch, slot, botPosition)}>
        <i className="fa fa-crosshairs" />
      </button>
      <p>{positionButtonTitle(botPosition)}</p>
    </fieldset>
    <fieldset>
      <label>{t("Gantry-mounted")}</label>
      <input type="checkbox"
        onChange={() =>
          dispatch(edit(slot, { gantry_mounted: !gantry_mounted }))}
        checked={gantry_mounted} />
    </fieldset>
  </div>;
};
