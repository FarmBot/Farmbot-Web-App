import * as React from "react";
import { Component } from "react";
import { TaggedPlantPointer } from "../../../resources/tagged_resources";
import { round, getXYFromQuadrant } from "../util";
import { cachedCrop } from "../../../open_farm/index";
import { MapTransformProps } from "../interfaces";

export interface SpreadLayerProps {
  visible: boolean;
  plants: TaggedPlantPointer[];
  currentPlant: TaggedPlantPointer | undefined;
  mapTransformProps: MapTransformProps;
}

export function SpreadLayer(props: SpreadLayerProps) {
  const { plants, visible, mapTransformProps } = props;
  return (
    <g id="spread-layer">
      <defs>
        <radialGradient id="SpreadGradient">
          <stop offset="90%" stopColor="rgba(85, 50, 10, 0.1)" />
          <stop offset="100%" stopColor="rgba(85, 50, 10, 0)" />
        </radialGradient>
      </defs>

      {visible &&
        plants.map((p, index) => {
          return <SpreadCircle
            plant={p}
            key={p.uuid}
            mapTransformProps={mapTransformProps} />;
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
    const { radius, x, y, id } = this.props.plant.body;
    const { quadrant, gridSize } = this.props.mapTransformProps;
    const { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant, gridSize);
    return <g id={"spread-" + id}>
      <circle
        className="spread"
        id={"spread-" + id}
        cx={qx}
        cy={qy}
        // Convert `spread` from diameter in cm to radius in mm.
        // `radius * 10` is the default value for spread.
        r={(this.state.spread || radius) / 2 * 10}
        fill={"url(#SpreadGradient)"} />
    </g>;
  }
}
