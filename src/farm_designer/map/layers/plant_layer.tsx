import * as React from "react";
import { Link } from "react-router";
import * as _ from "lodash";
import { GardenPlant } from "../garden_plant";
import { PlantLayerProps, CropSpreadDict } from "../interfaces";
import { defensiveClone } from "../../../util";

let cropSpreadDict: CropSpreadDict = {};

export function PlantLayer(p: PlantLayerProps) {
  let {
    crops,
    plants,
    dispatch,
    visible,
    currentPlant,
    dragging,
    editing,
    botOriginQuadrant
  } = p;

  crops
    .filter(c => !!c.body.spread)
    .map(c => cropSpreadDict[c.body.slug] = c.body.spread);

  if (visible) {
    return <g>
      {plants
        .filter(x => !!x.body.id)
        .map(p => defensiveClone(p))
        .map(p => {
          p.body.spread = cropSpreadDict[p.body.openfarm_slug] || p.body.radius;
          return p;
        })
        .map(p => {
          return {
            selected: !!(currentPlant && (p.uuid === currentPlant.uuid)),
            plantId: (p.body.id || "IMPOSSIBLE_ERR_NO_PLANT_ID").toString(),
            uuid: p.uuid,
            plant: p
          }
        })
        .map(props => {
          let action = { type: "SELECT_PLANT", payload: props.uuid };
          return <Link className="plant-link-wrapper"
            to={"/app/designer/plants/" + props.plantId}
            id={props.plantId}
            onClick={_.noop}
            key={props.plantId}>
            <GardenPlant
              quadrant={botOriginQuadrant}
              plant={props.plant}
              selected={props.selected}
              dragging={props.selected && dragging && editing}
              onClick={() => dispatch(action)}
              dispatch={p.dispatch}
            />
          </Link>;
        })}
    </g>
  } else {
    return <g />;
  }
}
