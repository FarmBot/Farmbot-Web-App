import * as React from "react";
import { TaggedPlantPointer } from "../../../resources/tagged_resources";
import { BotOriginQuadrant } from "../../interfaces";
import {
  round,
  scale,
  getXYFromQuadrant
} from "../util";

interface SpreadLayerProps {
  visible: boolean;
  plants: TaggedPlantPointer[];
  currentPlant: TaggedPlantPointer | undefined;
  botOriginQuadrant: BotOriginQuadrant;
}

export function SpreadLayer(props: SpreadLayerProps) {
  let { plants, visible, currentPlant, botOriginQuadrant } = props;

  return <g>
    {
      plants.map((p, index) => {
        let isSelected = p === currentPlant;
        return (visible || isSelected) ?
          <SpreadCircle
            plant={p}
            key={index}
            quadrant={botOriginQuadrant}
          /> : <g key={index} />;
      })
    }
  </g>
}

interface SpreadCircleProps {
  plant: TaggedPlantPointer;
  quadrant: BotOriginQuadrant;
}

export function SpreadCircle(props: SpreadCircleProps) {
  let { radius, x, y, spread } = props.plant.body;
  let { quadrant } = props;
  let { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant);
  return <circle
    cx={qx}
    cy={qy}
    r={scale(spread || radius)}
    fillOpacity={0.2}
    fill={"green"}
    stroke={"green"}
    strokeWidth={"1.5"}
  />;
}
