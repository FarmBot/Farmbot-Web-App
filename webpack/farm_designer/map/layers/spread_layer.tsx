import * as React from "react";
import { Component } from "react";
import { TaggedPlantPointer } from "../../../resources/tagged_resources";
import { round, scale, getXYFromQuadrant } from "../util";
import { cachedCrop } from "../../../open_farm/index";
import { MapTransformProps } from "../interfaces";

interface SpreadLayerProps {
  visible: boolean;
  plants: TaggedPlantPointer[];
  currentPlant: TaggedPlantPointer | undefined;
  mapTransformProps: MapTransformProps;
}

export function SpreadLayer(props: SpreadLayerProps) {
  const { plants, visible, currentPlant, mapTransformProps } = props;
  return (
    <g>
      {
        plants.map((p, index) => {
          const isSelected = p === currentPlant;
          return (visible || isSelected) ?
            <SpreadCircle
              plant={p}
              key={p.uuid}
              mapTransformProps={mapTransformProps} /> : <g key={p.uuid} />;
        })
      }
    </g>
  );
}

interface SpreadCircleProps {
  plant: TaggedPlantPointer;
  mapTransformProps: MapTransformProps;
}

interface SpreadCircleState {
  spread: number | undefined;
}

export class SpreadCircle extends
  Component<SpreadCircleProps, SpreadCircleState> {

  state: SpreadCircleState = { spread: undefined };

  componentDidMount() {
    cachedCrop(this.props.plant.body.openfarm_slug)
      .then(({ spread }) => this.setState({ spread }));
  }

  render() {
    const { radius, x, y } = this.props.plant.body;
    const { quadrant, gridSize } = this.props.mapTransformProps;
    const { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant, gridSize);
    return (
      <circle
        cx={qx}
        cy={qy}
        r={scale(this.state.spread || radius)}
        fillOpacity={0.2}
        fill={"green"}
        stroke={"green"}
        strokeWidth={"1.5"} />
    );
  }
}
