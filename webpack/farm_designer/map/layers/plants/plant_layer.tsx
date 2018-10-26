import * as React from "react";
import * as _ from "lodash";
import { GardenPlant } from "./garden_plant";
import { PlantLayerProps, CropSpreadDict } from "../../interfaces";
import { defensiveClone, unpackUUID } from "../../../../util";
import { maybeNoPointer } from "../../util";
import { Link } from "../../../../link";

const cropSpreadDict: CropSpreadDict = {};

export function PlantLayer(props: PlantLayerProps) {
  const {
    mapTransformProps,
    dispatch,
    visible,
    plants,
    crops,
    currentPlant,
    dragging,
    editing,
    selectedForDel,
    zoomLvl,
    activeDragXY,
    animate,
  } = props;

  crops
    .filter(c => !!c.body.spread)
    .map(c => cropSpreadDict[c.body.slug] = c.body.spread);

  return <g id="plant-layer">
    {visible &&
      plants
        .filter(x => !!x.body.id)
        .map(p => defensiveClone(p))
        .map(p => {
          return {
            selected: !!(currentPlant && (p.uuid === currentPlant.uuid)),
            grayscale: !!(selectedForDel && (selectedForDel.includes(p.uuid))),
            plantId: (p.body.id || "IMPOSSIBLE_ERR_NO_PLANT_ID").toString(),
            uuid: p.uuid,
            plant: p
          };
        })
        .map(p => {
          const plantCategory =
            unpackUUID(p.uuid).kind === "PlantTemplate"
              ? "saved_gardens/templates"
              : "plants";
          return <Link className="plant-link-wrapper"
            style={maybeNoPointer({})}
            to={`/app/designer/${plantCategory}/${p.plantId}`}
            id={p.plantId}
            onClick={_.noop}
            key={p.plantId}>
            <GardenPlant
              uuid={p.uuid}
              mapTransformProps={mapTransformProps}
              plant={p.plant}
              selected={p.selected}
              grayscale={p.grayscale}
              dragging={p.selected && dragging && editing}
              dispatch={dispatch}
              zoomLvl={zoomLvl}
              activeDragXY={activeDragXY}
              animate={animate} />
          </Link>;
        })}
  </g>;
}
