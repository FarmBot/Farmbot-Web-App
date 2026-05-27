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

type ExpandedAction = ReturnType<typeof expandActions>[number];

export const getVisualizationPoints = (
  config: Config,
  stashedPos: PositionConfig,
  actions: ExpandedAction[],
) => {
  const getWorldPosition = getWorldPositionFunc(config);
  const { x, y, z } = stashedPos;
  const points = [getWorldPosition({
    x: x + config.bedXOffset - config.bedLengthOuter / 2,
    y: y + config.bedYOffset - config.bedWidthOuter / 2,
    z: z + config.columnLength + 40 - config.zGantryOffset,
  })];
  for (const action of actions) {
    if (action.type != "expanded_move_absolute") { continue; }
    const coordinate = action.args as [number, number, number];
    points.push(getWorldPosition({
      x: coordinate[0],
      y: coordinate[1],
      z: coordinate[2],
    }));
  }
  return points;
};

export const Visualization = (props: VisualizationProps) => {
  const { visualizedSequenceUUID, config } = props;
  const { x, y, z } = props.configPosition;
  const visualizationPoints = React.useMemo(() => {
    if (!visualizedSequenceUUID) { return []; }
    const resources = store.getState().resources.index;
    const sequence = findSequence(resources, visualizedSequenceUUID);
    if (!sequence.body.id) { return []; }
    const stashedPos = { x, y, z };
    const actions =
      collectDemoSequenceActions(0, resources, sequence.body.id, []);
    return getVisualizationPoints(
      config,
      stashedPos,
      expandActions(actions, [], stashedPos),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizedSequenceUUID,
    config, x, y, z]);
  return visualizationPoints.length > 0 &&
    <Line name={"visualization"}
      color={"orange"}
      linewidth={2}
      points={visualizationPoints} />;
};
