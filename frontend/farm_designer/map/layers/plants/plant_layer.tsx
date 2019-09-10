import * as React from "react";
import { GardenPlant } from "./garden_plant";
import { PlantLayerProps, Mode } from "../../interfaces";
import { unpackUUID } from "../../../../util";
import { maybeNoPointer, getMode } from "../../util";
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
      const plant = <GardenPlant
        uuid={p.uuid}
        mapTransformProps={mapTransformProps}
        plant={p}
        selected={selected}
        grayscale={grayscale}
        dragging={selected && dragging && editing}
        dispatch={dispatch}
        zoomLvl={zoomLvl}
        activeDragXY={activeDragXY}
        animate={animate} />;
      const wrapperProps = {
        className: "plant-link-wrapper",
        style: maybeNoPointer(p.body.id ? {} : { pointerEvents: "none" }),
        key: p.uuid,
      };
      return getMode() === Mode.addPointToGroup
        ? <g {...wrapperProps}>{plant}</g>
        : <Link {...wrapperProps}
          to={`/app/designer/${plantCategory}/${"" + p.body.id}`}>
          {plant}
        </Link>;
    })}
  </g>;
}
