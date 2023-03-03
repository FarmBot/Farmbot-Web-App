import React from "react";
import { MapTransformProps, TaggedPlant } from "../../interfaces";
import { transformXY } from "../../util";

export interface PlantRadiusLayerProps {
  visible: boolean;
  plants: TaggedPlant[];
  mapTransformProps: MapTransformProps;
  animate: boolean;
  currentPlant: TaggedPlant | undefined;
  hoveredSpread: number | undefined;
}

export function PlantRadiusLayer(props: PlantRadiusLayerProps) {
  const { plants, mapTransformProps, visible, animate } = props;
  return <g id="plant-radius-layer">
    <defs>
      <radialGradient id="PlantRadiusGradient">
        <stop offset="90%" stopColor="rgb(85, 50, 10)" stopOpacity={0.1} />
        <stop offset="100%" stopColor="rgb(85, 50, 10)" stopOpacity={0} />
      </radialGradient>
    </defs>
    {visible && plants.map(p =>
      <PlantRadius
        plant={p}
        currentPlant={props.currentPlant}
        hoveredSpread={props.hoveredSpread}
        key={`plant-radius-${p.uuid}`}
        mapTransformProps={mapTransformProps}
        visible={true}
        animate={animate} />)}
  </g>;
}

export interface PlantRadiusProps {
  currentPlant: TaggedPlant | undefined;
  hoveredSpread: number | undefined;
  plant: TaggedPlant;
  mapTransformProps: MapTransformProps;
  visible: boolean;
  animate: boolean;
}

export const PlantRadius = (props: PlantRadiusProps) => {
  const {
    visible, mapTransformProps, animate, plant, currentPlant, hoveredSpread,
  } = props;
  const { x, y, id } = plant.body;
  const radius = plant.uuid == currentPlant?.uuid && hoveredSpread
    ? hoveredSpread / 2
    : props.plant.body.radius;
  const { qx, qy } = transformXY(x, y, mapTransformProps);
  return <g id={`plant-radius-${id}`}>
    {visible &&
      <circle
        className={"plant-radius " + (animate ? "animate" : "")}
        id={`plant-radius-${id}`}
        cx={qx}
        cy={qy}
        r={radius}
        fill={"url(#PlantRadiusGradient)"} />}
  </g>;
};
