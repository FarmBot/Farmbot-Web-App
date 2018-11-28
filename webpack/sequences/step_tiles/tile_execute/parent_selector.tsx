import * as React from "react";
import { TileMoveAbsSelect } from "../tile_move_absolute/select";
import { t } from "i18next";
import { ResourceIndex } from "../../../resources/interfaces";
import { Identifier, Coordinate, Point, Tool } from "farmbot";
import { CALLBACK } from "../tile_move_absolute/interfaces";

interface Props {
  targetUuid: string;
  deprecatedResources: ResourceIndex;
  selected: Coordinate | Identifier | Point | Tool;
  onChange: CALLBACK;
}

export function ParentSelector(p: Props) {
  const { deprecatedResources, selected, onChange, targetUuid } = p;
  const meta = Object.values(deprecatedResources.sequenceMetas[targetUuid] || {});
  return <div>
    {meta.map(val => {
      return <div key={val.celeryNode.args.label}>
        <label>{t(`Set '${val.celeryNode.args.label}' value to:`)}</label>
        <TileMoveAbsSelect
          resources={deprecatedResources}
          selectedItem={selected}
          onChange={onChange}
          shouldDisplay={() => /* Handled by the parent of this comp. */ true} />
      </div>;
    })}
  </div>;
}
