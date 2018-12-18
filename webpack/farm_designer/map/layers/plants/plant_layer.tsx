import * as React from "react";
import * as _ from "lodash";
import { GardenPlant } from "./garden_plant";
import { PlantLayerProps } from "../../interfaces";
import { unpackUUID } from "../../../../util";
import { maybeNoPointer } from "../../util";
import { Link } from "../../../../link";

export function PlantLayer(props: PlantLayerProps) {
  const {
    plants,
    currentPlant,
    dragging,
    editing,
    visible,
    dispatch,
    mapTransformProps,
    zoomLvl,
    activeDragXY,
    selectedForDel,
    animate,
  } = props;

  return <g id="plant-layer">
    {visible && plants.map(p => {
      const selected = !!(currentPlant && (p.uuid === currentPlant.uuid));
      const grayscale = !!(selectedForDel && (selectedForDel.includes(p.uuid)));
      const plantCategory = unpackUUID(p.uuid).kind === "PlantTemplate"
        ? "saved_gardens/templates"
        : "plants";
      return <Link className="plant-link-wrapper"
        style={maybeNoPointer(p.body.id ? {} : { pointerEvents: "none" })}
        to={`/app/designer/${plantCategory}/${"" + p.body.id}`}
        key={p.uuid}>
        <GardenPlant
          uuid={p.uuid}
          mapTransformProps={mapTransformProps}
          plant={p}
          selected={selected}
          grayscale={grayscale}
          dragging={selected && dragging && editing}
          dispatch={dispatch}
          zoomLvl={zoomLvl}
          activeDragXY={activeDragXY}
          animate={animate} />
      </Link>;
    })}
  </g>;
}
