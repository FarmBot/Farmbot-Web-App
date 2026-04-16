import React from "react";
import { Line } from "@react-three/drei";
import { collectDemoSequenceActions } from "../demo/lua_runner";
import { store } from "../redux/store";
import { findSequence } from "../resources/selectors_by_kind";
import { expandActions } from "../demo/lua_runner/actions";
import { getWorldPositionFunc } from "./helpers";
import { Config, PositionConfig } from "./config";

export interface VisualizationProps {
  visualizedSequenceUUID: string | undefined;
  config: Config;
  configPosition: PositionConfig;
}

export const Visualization = (props: VisualizationProps) => {
  const { visualizedSequenceUUID, config } = props;
  const { x, y, z } = props.configPosition;
  const getWorldPosition = getWorldPositionFunc(config);
  const visualizationPoints = React.useMemo(() => {
    if (!visualizedSequenceUUID) { return []; }
    const resources = store.getState().resources.index;
    const sequence = findSequence(resources, visualizedSequenceUUID);
    if (!sequence.body.id) { return []; }
    const stashedPos = { x, y, z };
    const actions =
      collectDemoSequenceActions(0, resources, sequence.body.id, []);
    const points = [[
      stashedPos.x + config.bedXOffset - config.bedLengthOuter / 2,
      stashedPos.y + config.bedYOffset - config.bedWidthOuter / 2,
      z + config.columnLength + 40 - config.zGantryOffset,
    ] as [number, number, number]]
      .concat(expandActions(actions, [], stashedPos)
        .filter(action => action.type == "expanded_move_absolute")
        .map(action => action.args as [number, number, number]))
      .map(coordinate => getWorldPosition({
        x: coordinate[0],
        y: coordinate[1],
        z: coordinate[2],
      }));
    return points;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizedSequenceUUID,
    config, getWorldPosition, x, y, z]);
  return visualizationPoints.length > 0 &&
    <Line name={"visualization"}
      color={"orange"}
      linewidth={2}
      points={visualizationPoints} />;
};
