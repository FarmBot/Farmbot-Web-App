import * as React from "react";
import { Link } from "react-router";
import * as _ from "lodash";
import { GardenPlant } from "../garden_plant";
import { PlantLayerProps, CropSpreadDict } from "../interfaces";
import { defensiveClone } from "../../../util";

let cropSpreadDict: CropSpreadDict = {};

export function PlantLayer(props: PlantLayerProps) {
  let {
    crops,
    plants,
    dispatch,
    visible,
    currentPlant,
    dragging,
    editing,
    botOriginQuadrant
  } = props;

  crops
    .filter(c => !!c.body.spread)
    .map(c => cropSpreadDict[c.body.slug] = c.body.spread);

  if (visible) {
    return <g>
      {plants
        .filter(x => !!x.body.id)
        .map(p => defensiveClone(p))
        .map(p => {
          return p;
        })
        .map(p => {
          return {
            selected: !!(currentPlant && (p.uuid === currentPlant.uuid)),
            plantId: (p.body.id || "IMPOSSIBLE_ERR_NO_PLANT_ID").toString(),
            uuid: p.uuid,
            plant: p
          };
        })
        .map(p => {
          let action = { type: "SELECT_PLANT", payload: p.uuid };
          return <Link className="plant-link-wrapper"
            to={"/app/designer/plants/" + p.plantId}
            id={p.plantId}
            onClick={_.noop}
            key={p.plantId}>
            <GardenPlant
              quadrant={botOriginQuadrant}
              plant={p.plant}
              selected={p.selected}
              dragging={p.selected && dragging && editing}
              onClick={() => dispatch(action)}
              dispatch={props.dispatch} />
          </Link>;
        })}
    </g>;
  } else {
    return <g />;
  }
}
