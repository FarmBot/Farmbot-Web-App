import React from "react";
import { round, transformXY, defaultSpreadCmDia } from "../../util";
import { cachedCrop } from "../../../../open_farm/cached_crop";
import { MapTransformProps, TaggedPlant } from "../../interfaces";
import { SpreadOverlapHelper } from "./spread_overlap_helper";
import { BotPosition } from "../../../../devices/interfaces";
import { Color } from "../../../../ui";

export interface SpreadLayerProps {
  visible: boolean;
  plants: TaggedPlant[];
  currentPlant: TaggedPlant | undefined;
  mapTransformProps: MapTransformProps;
  dragging: boolean;
  zoomLvl: number;
  activeDragXY: BotPosition | undefined;
  activeDragSpread: number | undefined;
  editing: boolean;
  animate: boolean;
  hoveredSpread: number | undefined;
}

export function SpreadLayer(props: SpreadLayerProps) {
  const {
    plants, visible, mapTransformProps, currentPlant, hoveredSpread,
    dragging, zoomLvl, activeDragXY, activeDragSpread, editing, animate
  } = props;
  return <g id="spread-layer">
    {plants.map(p => {
      const selected = p.uuid === currentPlant?.uuid;
      return <g id={"spread-components-" + p.body.id} key={p.uuid}>
        {visible &&
          <SpreadCircle
            plant={p}
            hoveredSpread={hoveredSpread}
            selected={selected}
            key={"spread-" + p.uuid}
            mapTransformProps={mapTransformProps}
            visible={true}
            animate={animate} />}
        <SpreadOverlapHelper
          key={"overlap-" + p.uuid}
          dragging={selected && dragging && editing}
          plant={p}
          mapTransformProps={mapTransformProps}
          zoomLvl={zoomLvl}
          activeDragXY={activeDragXY}
          activeDragSpread={activeDragSpread} />
      </g>;
    })}
  </g>;
}

export interface SpreadCircleProps {
  plant: TaggedPlant;
  mapTransformProps: MapTransformProps;
  visible: boolean;
  animate: boolean;
  hoveredSpread: number | undefined;
  selected: boolean;
}

interface SpreadCircleState {
  spread: number | undefined;
  loaded: boolean;
}

export class SpreadCircle extends
  React.Component<SpreadCircleProps, SpreadCircleState> {
  state: SpreadCircleState = { spread: undefined, loaded: false };

  fetchSpread = () => {
    cachedCrop(this.props.plant.body.openfarm_slug)
      .then(({ spread }) => this.setState({ spread, loaded: true }));
  };

  componentDidMount = () => this.fetchSpread();
  componentDidUpdate = (prevProps: SpreadCircleProps) =>
    this.props.plant.body.openfarm_slug != prevProps.plant.body.openfarm_slug &&
    this.fetchSpread();

  render() {
    const { radius, x, y, id } = this.props.plant.body;
    const { visible, mapTransformProps, animate } = this.props;
    const { qx, qy } = transformXY(round(x), round(y), mapTransformProps);
    const spreadDiaCm = this.state.loaded
      ? this.state.spread || defaultSpreadCmDia(radius)
      : 0;
    return <g id={"spread-" + id}>
      {visible &&
        <circle
          className={"spread " + (animate ? "animate" : "")}
          id={"spread-" + id}
          cx={qx}
          cy={qy}
          // Convert `spread` from diameter in cm to radius in mm.
          r={spreadDiaCm / 2 * 10}
          strokeWidth={2}
          stroke={this.state.spread ? Color.darkGreen : Color.offWhite}
          opacity={0.5}
          fill={"none"} />}
      {this.props.hoveredSpread && this.props.selected &&
        <circle
          cx={qx}
          cy={qy}
          r={this.props.hoveredSpread / 2}
          strokeWidth={2}
          stroke={Color.darkGreen}
          opacity={0.5}
          fill={"none"} />}
    </g>;
  }
}
