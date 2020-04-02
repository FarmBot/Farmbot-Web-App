import * as React from "react";
import { GardenPlant } from "./garden_plant";
import { PlantLayerProps, Mode } from "../../interfaces";
import { unpackUUID } from "../../../../util";
import { getMode } from "../../util";
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
    boxSelected,
    groupSelected,
    animate,
    hoveredPlant,
  } = props;

  return <g id="plant-layer">
    {visible && plants.map(p => {
      const current = p.uuid === currentPlant?.uuid;
      const hovered = p.uuid === hoveredPlant?.uuid;
      const selectedByBox = !!boxSelected?.includes(p.uuid);
      const selectedByGroup = groupSelected.includes(p.uuid);
      const plantCategory = unpackUUID(p.uuid).kind === "PlantTemplate"
        ? "gardens/templates"
        : "plants";
      const plant = <GardenPlant
        uuid={p.uuid}
        mapTransformProps={mapTransformProps}
        plant={p}
        selected={selectedByBox || selectedByGroup}
        current={current}
        editing={editing}
        dragging={current && dragging && editing}
        dispatch={dispatch}
        zoomLvl={zoomLvl}
        activeDragXY={activeDragXY}
        hovered={hovered}
        animate={animate} />;
      const style: React.SVGProps<SVGGElement>["style"] =
        (props.interactions && p.body.id)
          ? { cursor: "pointer" } : { pointerEvents: "none" };
      const wrapperProps = {
        className: "plant-link-wrapper",
        style,
        key: p.uuid,
      };
      return (getMode() === Mode.editGroup || getMode() === Mode.boxSelect)
        ? <g {...wrapperProps}>{plant}</g>
        : <Link {...wrapperProps}
          to={`/app/designer/${plantCategory}/${"" + p.body.id}`}>
          {plant}
        </Link>;
    })}
  </g>;
}
