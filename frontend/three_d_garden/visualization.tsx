import React from "react";
import { Line } from "@react-three/drei";
import { collectDemoSequenceActions } from "../demo/lua_runner";
import { store } from "../redux/store";
import { findSequence } from "../resources/selectors_by_kind";
import { expandActions } from "../demo/lua_runner/actions";
import { Config, PositionConfig } from "./config";

export interface VisualizationProps {
  visualizedSequenceUUID: string | undefined;
  config: Config;
  configPosition: PositionConfig;
}

type ExpandedAction = ReturnType<typeof expandActions>[number];
type SequenceAction = ReturnType<typeof collectDemoSequenceActions>[number];
type VisualizationPoint = [number, number, number];
type VisualizationConfig = Pick<Config,
  "bedXOffset" | "bedYOffset" | "bedLengthOuter" | "bedWidthOuter"
  | "columnLength" | "zGantryOffset" | "mirrorX" | "mirrorY">;

const EMPTY_SEQUENCE_ACTIONS: SequenceAction[] = [];
const EMPTY_EXPANDED_ACTIONS: ExpandedAction[] = [];
const EMPTY_VISUALIZATION_POINTS: VisualizationPoint[] = [];

const getVisualizationWorldPositionFunc = (config: VisualizationConfig) =>
  (gardenPosition: Record<"x" | "y" | "z", number>): VisualizationPoint => {
    const x = gardenPosition.x + config.bedXOffset
      - config.bedLengthOuter / 2;
    const y = gardenPosition.y + config.bedYOffset
      - config.bedWidthOuter / 2;
    return [
      config.mirrorX ? -x : x,
      config.mirrorY ? -y : y,
      config.columnLength + 40 - config.zGantryOffset + gardenPosition.z,
    ];
  };

export const getVisualizationPoints = (
  config: VisualizationConfig,
  stashedPos: PositionConfig,
  actions: ExpandedAction[],
) => {
  const getWorldPosition = getVisualizationWorldPositionFunc(config);
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

interface VisualizationLineProps {
  points: VisualizationPoint[];
}

const VisualizationLine = React.memo((props: VisualizationLineProps) =>
  <Line name={"visualization"}
    color={"orange"}
    linewidth={2}
    points={props.points} />);

export const Visualization = (props: VisualizationProps) => {
  const { visualizedSequenceUUID, config } = props;
  const { x, y, z } = props.configPosition;
  const resources = store.getState().resources.index;
  const sequence = visualizedSequenceUUID
    ? findSequence(resources, visualizedSequenceUUID)
    : undefined;
  const sequenceId = sequence?.body.id;
  const stashedPos = React.useMemo(() => ({ x, y, z }), [x, y, z]);
  const sequenceActions = React.useMemo(() => {
    if (!visualizedSequenceUUID || !sequenceId) {
      return EMPTY_SEQUENCE_ACTIONS;
    }
    return collectDemoSequenceActions(0, resources, sequenceId, []);
  }, [visualizedSequenceUUID, resources, sequenceId]);
  const expandedActions = React.useMemo(() => {
    if (!sequenceId) { return EMPTY_EXPANDED_ACTIONS; }
    return expandActions(sequenceActions, [], stashedPos);
  }, [sequenceId, sequenceActions, stashedPos]);
  const {
    bedXOffset, bedYOffset, bedLengthOuter, bedWidthOuter,
    columnLength, zGantryOffset, mirrorX, mirrorY,
  } = config;
  const visualizationConfig = React.useMemo(() => ({
    bedXOffset,
    bedYOffset,
    bedLengthOuter,
    bedWidthOuter,
    columnLength,
    zGantryOffset,
    mirrorX,
    mirrorY,
  }), [
    bedXOffset, bedYOffset, bedLengthOuter, bedWidthOuter,
    columnLength, zGantryOffset, mirrorX, mirrorY,
  ]);
  const visualizationPoints = React.useMemo(() => {
    if (!sequenceId) { return EMPTY_VISUALIZATION_POINTS; }
    return getVisualizationPoints(
      visualizationConfig,
      stashedPos,
      expandedActions,
    );
  }, [sequenceId, visualizationConfig, stashedPos, expandedActions]);
  return visualizationPoints.length > 0 &&
    <VisualizationLine points={visualizationPoints} />;
};
