import { TaggedPlant } from "../../farm_designer/map/interfaces";
import { Config } from "../config";
import { GARDENS, PLANTS } from "../constants";
import { Billboard, Image } from "@react-three/drei";
import React from "react";
import { Vector3 } from "three";
import { threeSpace, zZero as zZeroFunc } from "../helpers";
import { Text } from "../elements";
import { findIcon } from "../../crops/find";
import { kebabCase } from "lodash";

interface Plant {
  label: string;
  icon: string;
  size: number;
  spread: number;
  x: number;
  y: number;
}

export interface ThreeDGardenPlant extends Plant { }

export const convertPlants = (config: Config, plants: TaggedPlant[]): Plant[] => {
  return plants.map(plant => {
    return {
      label: plant.body.name,
      icon: findIcon(plant.body.openfarm_slug),
      size: plant.body.radius * 2,
      spread: 0,
      x: plant.body.x + config.bedXOffset,
      y: plant.body.y + config.bedYOffset,
    };
  });
};

export const calculatePlantPositions = (config: Config): Plant[] => {
  const gardenPlants = GARDENS[config.plants] || [];
  const positions: Plant[] = [];
  const startX = 350;
  let nextX = startX;
  let index = 0;
  while (nextX <= config.bedLengthOuter - 100) {
    const plantKey = gardenPlants[index];
    const plant = PLANTS[plantKey];
    if (!plant) { return []; }
    const icon = findIcon(kebabCase(plant.label));
    positions.push({
      ...plant,
      icon,
      x: nextX,
      y: config.bedWidthOuter / 2,
    });
    const plantsPerHalfRow =
      Math.ceil((config.bedWidthOuter - plant.spread) / 2 / plant.spread);
    for (let i = 1; i < plantsPerHalfRow; i++) {
      positions.push({
        ...plant,
        icon,
        x: nextX,
        y: config.bedWidthOuter / 2 + plant.spread * i,
      });
      positions.push({
        ...plant,
        icon,
        x: nextX,
        y: config.bedWidthOuter / 2 - plant.spread * i,
      });
    }
    if (index + 1 < gardenPlants.length) {
      const nextPlant = PLANTS[gardenPlants[index + 1]];
      nextX += (plant.spread / 2) + (nextPlant.spread / 2);
      index++;
    } else {
      index = 0;
      const nextPlant = PLANTS[gardenPlants[0]];
      nextX += (plant.spread / 2) + (nextPlant.spread / 2);
    }
  }
  return positions;
};

export interface ThreeDPlantProps {
  plant: Plant;
  i: number;
  labelOnly?: boolean;
  config: Config;
  hoveredPlant: number | undefined;
}

export const ThreeDPlant = (props: ThreeDPlantProps) => {
  const { i, plant, labelOnly, config, hoveredPlant } = props;
  const alwaysShowLabels = config.labels && !config.labelsOnHover;
  return <Billboard follow={true}
    position={new Vector3(
      threeSpace(plant.x, config.bedLengthOuter),
      threeSpace(plant.y, config.bedWidthOuter),
      zZeroFunc(config) - config.soilHeight + plant.size / 2,
    )}>
    {labelOnly
      ? <Text visible={alwaysShowLabels || i === hoveredPlant}
        renderOrder={2}
        fontSize={50}
        color={"white"}
        position={[0, plant.size / 2 + 40, 0]}
        rotation={[0, 0, 0]}>
        {plant.label}
      </Text>
      : <Image url={plant.icon} scale={plant.size} name={"" + i}
        transparent={true}
        renderOrder={1} />}
  </Billboard>;
};
