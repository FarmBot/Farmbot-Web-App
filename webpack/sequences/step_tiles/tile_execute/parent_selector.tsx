import * as React from "react";
import { TileMoveAbsSelect } from "../tile_move_absolute/select";
import { t } from "i18next";
import { ResourceIndex } from "../../../resources/interfaces";
import { Identifier, Coordinate, Point, Tool } from "farmbot";
import { CALLBACK } from "../tile_move_absolute/interfaces";

interface Props {
  resources: ResourceIndex;
  selected: Coordinate | Identifier | Point | Tool;
  onChange: CALLBACK;
}

export function ParentSelector({ resources, selected, onChange }: Props) {
  return <div>
    <label>{t("Set value of 'parent' to:")}</label>
    <TileMoveAbsSelect
      resources={resources}
      selectedItem={selected}
      onChange={onChange}
      shouldDisplay={() => /* Handled by the parent of this comp. */ true} />
    <p>Debug info: {selected.kind}</p>
  </div>;
}
