import React from "react";
import { Line } from "@react-three/drei";
import { collectDemoSequenceActions } from "../demo/lua_runner";
import { store } from "../redux/store";
import { findSequence } from "../resources/selectors_by_kind";
import { expandActions } from "../demo/lua_runner/actions";
import { threeSpace, zZero as zZeroFunc } from "./helpers";
import { Config, PositionConfig } from "./config";

export interface VisualizationProps {
  visualizedSequenceUUID: string | undefined;
  config: Config;
  configPosition: PositionConfig;
}

export const Visualization = (props: VisualizationProps) => {
  const { visualizedSequenceUUID, config } = props;
  const { bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset } = config;
  const { x, y, z } = props.configPosition;
  const zZero = zZeroFunc(config);
  const visualizationPoints = React.useMemo(() => {
    if (!visualizedSequenceUUID) { return []; }
    const resources = store.getState().resources.index;
    const sequence = findSequence(resources, visualizedSequenceUUID);
    if (!sequence.body.id) { return []; }
    const stashedPos = { x, y, z };
    const actions =
      collectDemoSequenceActions(0, resources, sequence.body.id, []);
    const points = [[stashedPos.x, stashedPos.y, stashedPos.z]]
      .concat(expandActions(actions, [], stashedPos)
        .filter(action => action.type == "expanded_move_absolute")
        .map(action => action.args as [number, number, number]))
      .map(coordinate => [
        threeSpace(coordinate[0], bedLengthOuter) + bedXOffset,
        threeSpace(coordinate[1], bedWidthOuter) + bedYOffset,
        zZero + coordinate[2],
      ] as [number, number, number]);
    return points;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizedSequenceUUID,
    bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset,
    zZero]);
  return visualizationPoints.length > 0 &&
    <Line name={"visualization"}
      color={"orange"}
      linewidth={2}
      points={visualizationPoints} />;
};
