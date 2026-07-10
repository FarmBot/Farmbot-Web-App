import React from "react";
import { Config, PositionConfig } from "../config";
import { Group } from "../components";
import { FocusVisibilityGroup } from "../focus_transition";
import { SlotWithTool } from "../../resources/interfaces";
import {
  ThreeDObjectHoverHandler, ThreeDObjectHoverLabelHandler,
  ThreeDObjectSelectionHandler,
} from "../selection_types";
import { Tools, XAxisWaterTube } from "./components";
import { WaterFlowTextureProvider } from "./components/water_stream";
import {
  CrossSlideAssembly, EffectsAssembly, GantryAssembly, RoutingAssembly,
  StationaryAssembly, ZAxisAssembly,
} from "./assemblies";
import { getBotKinematics } from "./kinematics";
import { getBotVersion } from "./bot_versions";
import { useBotShapes } from "./bot_shapes";
import { useBotPositionSpring } from "./position_spring";
import {
  getDemoMovementStopVersion,
  getDemoMovementTarget,
  registerDemoMovementDriver,
  reportDemoMovementComplete,
  reportDemoMovementPosition,
} from "../../demo/lua_runner/movement";

export { clearBotShapeCache } from "./bot_shapes";

export interface FarmbotModelProps {
  config: Config;
  configPosition: PositionConfig;
  activeFocus: string;
  getZ(x: number, y: number): number;
  trailReady?: boolean;
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
  dispatch?: Function;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  onToolSlotHoverObject?: ThreeDObjectHoverHandler;
  onHoverLabel?: ThreeDObjectHoverLabelHandler;
}

export const Bot = (props: FarmbotModelProps) =>
  props.config.bot ? <EnabledBot {...props} /> : undefined;

type BotPositionTransformConfig = Pick<Config,
  "botSizeX" | "botSizeY" | "mirrorX" | "mirrorY">;

export const getUnmirroredBotPosition = (
  config: BotPositionTransformConfig,
  position: PositionConfig,
): PositionConfig => ({
  x: config.mirrorX ? config.botSizeX - position.x : position.x,
  y: config.mirrorY ? config.botSizeY - position.y : position.y,
  z: position.z,
});

export const getDemoMovementSpringCallbacks = (
  config: BotPositionTransformConfig,
) => {
  const toGardenPosition = (position: PositionConfig) =>
    getUnmirroredBotPosition(config, position);
  return {
    onChange: (position: PositionConfig) =>
      reportDemoMovementPosition(toGardenPosition(position)),
    onRest: (position: PositionConfig) =>
      reportDemoMovementComplete(toGardenPosition(position)),
  };
};

export const getBotSpringTarget = (
  config: BotPositionTransformConfig,
  reportedPosition: PositionConfig,
  demoTarget = getDemoMovementTarget(),
): PositionConfig => demoTarget
  ? getUnmirroredBotPosition(config, demoTarget)
  : reportedPosition;

const EnabledBot = (props: FarmbotModelProps) => {
  const { config } = props;
  const { botSizeX, botSizeY, mirrorX, mirrorY } = config;
  const springCallbacks = React.useMemo(
    () => getDemoMovementSpringCallbacks({
      botSizeX,
      botSizeY,
      mirrorX,
      mirrorY,
    }),
    [botSizeX, botSizeY, mirrorX, mirrorY],
  );
  const springTarget = getBotSpringTarget(config, props.configPosition);
  const configPosition = useBotPositionSpring(
    springTarget,
    config.animate,
    springCallbacks,
    getDemoMovementStopVersion(),
  );
  React.useEffect(() => config.animate
    ? registerDemoMovementDriver()
    : undefined, [config.animate]);
  const version = getBotVersion(config.kitVersion);
  const shapes = useBotShapes(config.tracks, version);
  const kinematics = getBotKinematics(config, configPosition, version);
  const trailReady = props.trailReady !== false;

  return <WaterFlowTextureProvider waterFlow={config.waterFlow}>
    <FocusVisibilityGroup name={"bot"}
      keepMounted={true}
      preserveDepthWrite={true}
      visible={props.activeFocus != "Planter bed"}>
      <Group name={"bot-static"}>
        <Group position={kinematics.machineOrigin}>
          <StationaryAssembly
            config={config}
            trackShape={shapes.track} />
          <Tools
            {...props}
            configPosition={configPosition}
            frame={"stationary"} />
        </Group>
        <XAxisWaterTube config={config} />
      </Group>
      <Group name={"bot-machine"} position={kinematics.machineOrigin}>
        <Group name={"bot-gantry"} position={kinematics.gantryPosition}>
          <GantryAssembly
            config={config}
            configPosition={configPosition}
            version={version}
            columnShape={shapes.column}
            beamShape={shapes.beam}
            onSelectObject={props.onSelectObject}
            onHoverObject={props.onHoverObject} />
          <Tools
            {...props}
            configPosition={configPosition}
            frame={"gantry"} />
          <Group name={"bot-cross-slide"}
            position={kinematics.crossSlidePosition}>
            <CrossSlideAssembly
              config={config}
              version={version}
              onSelectObject={props.onSelectObject}
              onHoverObject={props.onHoverObject} />
            <Group name={"bot-z-axis"}
              position={kinematics.zAxisPosition}>
              <ZAxisAssembly
                config={config}
                configPosition={configPosition}
                version={version}
                zAxisShape={shapes.zAxis}
                trailReady={trailReady}
                onSelectObject={props.onSelectObject}
                onHoverObject={props.onHoverObject} />
              <Tools
                {...props}
                configPosition={configPosition}
                frame={"z-axis"} />
            </Group>
          </Group>
        </Group>
      </Group>
      <Group name={"bot-routing"} position={kinematics.machineOrigin}>
        <RoutingAssembly
          config={config}
          configPosition={configPosition}
          version={version} />
      </Group>
      <Group name={"bot-effects"}>
        <EffectsAssembly
          config={config}
          configPosition={configPosition}
          version={version}
          getZ={props.getZ} />
      </Group>
    </FocusVisibilityGroup>
  </WaterFlowTextureProvider>;
};
