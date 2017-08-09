import * as React from "react";
import { Component } from "react";
import { TaggedPlantPointer } from "../../../resources/tagged_resources";
import { BotOriginQuadrant } from "../../interfaces";
import {
  round,
  scale,
  getXYFromQuadrant
} from "../util";
import { cachedCrop } from "../../../open_farm/index";

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
  </g>;
}

interface SpreadCircleProps {
  plant: TaggedPlantPointer;
  quadrant: BotOriginQuadrant;
}

interface SpreadCircleState {
  spread: number | undefined;
}

export class SpreadCircle extends Component<SpreadCircleProps, SpreadCircleState> {

  state: SpreadCircleState = { spread: undefined };

  componentDidMount() {
    cachedCrop(this.props.plant.body.openfarm_slug)
      .then(({ spread }) => this.setState({ spread }));
  }

  render() {
    let { radius, x, y } = this.props.plant.body;
    let { quadrant } = this.props;
    let { qx, qy } = getXYFromQuadrant(round(x), round(y), quadrant);
    return <circle
      cx={qx}
      cy={qy}
      r={scale(this.state.spread || radius)}
      fillOpacity={0.2}
      fill={"green"}
      stroke={"green"}
      strokeWidth={"1.5"}
    />;
  }
}
