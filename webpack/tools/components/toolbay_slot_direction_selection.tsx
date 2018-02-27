import * as React from "react";
import { t } from "i18next";
import { FBSelect, DropDownItem } from "../../ui/index";
import { TaggedToolSlotPointer } from "../../resources/tagged_resources";
import { ToolPulloutDirection } from "../../interfaces";
import { edit } from "../../api/crud";
import { isNumber } from "lodash";

const DIRECTION_CHOICES_DDI: { [index: number]: DropDownItem } = {
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

const DIRECTION_CHOICES: DropDownItem[] = [
  DIRECTION_CHOICES_DDI[ToolPulloutDirection.NONE],
  DIRECTION_CHOICES_DDI[ToolPulloutDirection.POSITIVE_X],
  DIRECTION_CHOICES_DDI[ToolPulloutDirection.NEGATIVE_X],
  DIRECTION_CHOICES_DDI[ToolPulloutDirection.POSITIVE_Y],
  DIRECTION_CHOICES_DDI[ToolPulloutDirection.NEGATIVE_Y],
];

export interface SlotDirectionSelectProps {
  dispatch: Function;
  slot: TaggedToolSlotPointer;
}

export function SlotDirectionSelect(props: SlotDirectionSelectProps) {
  const { dispatch, slot } = props;
  const direction = slot.body.pullout_direction;

  const changePulloutDirection = (selectedDirection: DropDownItem) => {
    const { value } = selectedDirection;
    dispatch(edit(slot, {
      pullout_direction: isNumber(value) ? value : parseInt(value)
    }));
  };

  return <FBSelect
    list={DIRECTION_CHOICES}
    selectedItem={DIRECTION_CHOICES_DDI[direction]}
    onChange={changePulloutDirection} />;
}
