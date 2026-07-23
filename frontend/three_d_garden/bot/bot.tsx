import React from "react";
import { Object3D } from "three";
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
  CrossSlideAssembly, EffectsAssembly, FluidRoutingAssembly,
  FrameRoutingAssembly, GantryAssembly, StationaryAssembly, ZAxisAssembly,
} from "./assemblies";
import {
  BotKinematics, getBotKinematics, Vector3Tuple,
} from "./kinematics";
import { getBotVersion } from "./bot_versions";
import { useBotShapes } from "./bot_shapes";
import {
  BotPositionSnapshotStore, useBotPositionSnapshot,
  useBotPositionSpring,
} from "./position_spring";
import {
  getDemoMovementStopVersion,
  getDemoMovementPosition,
  getDemoMovementTarget,
  demoMovementActive,
  registerDemoMovementDriver,
  reportDemoMovementComplete,
  reportDemoMovementPosition,
  startDemoMovement,
} from "../../demo/lua_runner/movement";
import {
  perfEnabled, usePerfRenderCount,
} from "../../performance/perf";
import { Actions } from "../../constants";
import { SECTION_FAR_CLIPPING_EXEMPT } from "../section";
import {
  getNativeJogControlPositions, NativeJogControlPair,
  NativeJogAxisActionsContext, NativeJogEncoderData,
  NativeJogDragPreview, NativeJogEncoderVisibility,
  NativeJogPreviewState, NativeJogSelection, NativeJogWorldPreview,
} from "./native_jog_controls";

export { clearBotShapeCache } from "./bot_shapes";

export interface FarmbotModelProps {
  config: Config;
  configPosition: PositionConfig;
  activeFocus: string;
  getZ(x: number, y: number): number;
  trailReady?: boolean;
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
  navigate?(path: string): void;
  dispatch?: Function;
  axisActions?: NativeJogAxisActionsContext;
  encoderData?: NativeJogEncoderData;
  encoderVisibility?: NativeJogEncoderVisibility;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  onToolSlotHoverObject?: ThreeDObjectHoverHandler;
  onHoverLabel?: ThreeDObjectHoverLabelHandler;
  positionStore?: BotPositionSnapshotStore;
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

export interface BotKinematicObjects {
  gantry?: Object3D | null;
  crossSlide?: Object3D | null;
  zAxis?: Object3D | null;
  trailTarget?: Object3D | null;
}

export const applyBotKinematicFrame = (
  objects: BotKinematicObjects,
  kinematics: BotKinematics,
) => {
  objects.gantry?.position?.set(...kinematics.gantryPosition);
  objects.crossSlide?.position?.set(...kinematics.crossSlidePosition);
  objects.zAxis?.position?.set(...kinematics.zAxisPosition);
  objects.trailTarget?.position?.set(
    ...kinematics.anchors.utm.worldPosition,
  );
};

interface SnapshotAssembliesProps {
  config: Config;
  currentPosition: React.MutableRefObject<PositionConfig>;
  getZ(x: number, y: number): number;
  machineOrigin: [number, number, number];
  snapshotStore: BotPositionSnapshotStore;
  version: ReturnType<typeof getBotVersion>;
  onSelectObject?: ThreeDObjectSelectionHandler;
}

const SnapshotAssemblies = (props: SnapshotAssembliesProps) => {
  const configPosition = useBotPositionSnapshot(props.snapshotStore);
  return <>
    <Group name={"bot-fluid-routing"} position={props.machineOrigin}>
      <FluidRoutingAssembly
        config={props.config}
        configPosition={configPosition}
        positionRef={props.currentPosition}
        version={props.version} />
    </Group>
    <Group name={"bot-effects"}>
      <EffectsAssembly
        config={props.config}
        configPosition={configPosition}
        version={props.version}
        getZ={props.getZ}
        onSelectObject={props.onSelectObject} />
    </Group>
  </>;
};

interface SnapshotGantryToolsProps extends FarmbotModelProps {
  snapshotStore: BotPositionSnapshotStore;
}

const SnapshotGantryTools = (props: SnapshotGantryToolsProps) => {
  const configPosition = useBotPositionSnapshot(props.snapshotStore);
  return <Tools {...props}
    configPosition={configPosition}
    frame={"gantry"} />;
};

const addBotPositions = (
  ...positions: Vector3Tuple[]
): Vector3Tuple => [
  positions.reduce((total, position) => total + position[0], 0),
  positions.reduce((total, position) => total + position[1], 0),
  positions.reduce((total, position) => total + position[2], 0),
];

const EnabledBot = (props: FarmbotModelProps) => {
  usePerfRenderCount("EnabledBot");
  const { config, dispatch } = props;
  const { botSizeX, botSizeY, mirrorX, mirrorY } = config;
  const version = getBotVersion(config.kitVersion);
  const shapes = useBotShapes(config.tracks, version);
  const demoSpringCallbacks = React.useMemo(
    () => getDemoMovementSpringCallbacks({
      botSizeX,
      botSizeY,
      mirrorX,
      mirrorY,
    }),
    [botSizeX, botSizeY, mirrorX, mirrorY],
  );
  const springTarget = getBotSpringTarget(config, props.configPosition);
  const [initialKinematics] = React.useState(
    () => getBotKinematics(config, springTarget, version),
  );
  const gantry = React.useRef<Object3D | undefined>(undefined);
  const crossSlide = React.useRef<Object3D | undefined>(undefined);
  const zAxis = React.useRef<Object3D | undefined>(undefined);
  const trailTarget = React.useRef(new Object3D());
  const [jogSelection, setJogSelection] =
    React.useState<NativeJogSelection | undefined>();
  const [xJogPreview, setXJogPreview] =
    React.useState<NativeJogDragPreview | undefined>();
  const [yJogPreview, setYJogPreview] =
    React.useState<NativeJogDragPreview | undefined>();
  const [zJogPreview, setZJogPreview] =
    React.useState<NativeJogDragPreview | undefined>();
  const axisActionsAvailable = !!props.axisActions;
  const closeJogPopup = React.useCallback(() => {
    setJogSelection(undefined);
  }, []);
  React.useEffect(() => {
    if (!jogSelection || axisActionsAvailable) { return; }
    const timeout = window.setTimeout(closeJogPopup, 0);
    return () => window.clearTimeout(timeout);
  }, [
    axisActionsAvailable,
    closeJogPopup,
    jogSelection,
  ]);
  React.useEffect(() => {
    if (!jogSelection) { return; }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key != "Escape") { return; }
      event.preventDefault();
      closeJogPopup();
    };
    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [closeJogPopup, jogSelection]);
  const applyPosition = React.useCallback((position: PositionConfig) => {
    applyBotKinematicFrame(
      {
        gantry: gantry.current,
        crossSlide: crossSlide.current,
        zAxis: zAxis.current,
        trailTarget: trailTarget.current,
      },
      getBotKinematics(config, position, version),
    );
  }, [config, version]);
  const springCallbacks = React.useMemo(() => ({
    onChange: (position: PositionConfig) => {
      applyPosition(position);
      demoSpringCallbacks.onChange(position);
    },
    onRest: demoSpringCallbacks.onRest,
  }), [applyPosition, demoSpringCallbacks]);
  const springResetKey = getDemoMovementStopVersion();
  const { snapshotStore, currentPosition } =
    useBotPositionSpring(
      springTarget,
      config.animate,
      springCallbacks,
      springResetKey,
      props.positionStore,
    );
  React.useLayoutEffect(() => {
    applyPosition(currentPosition.current);
  }, [applyPosition, config.animate, currentPosition, springResetKey]);
  React.useEffect(() => config.animate
    ? registerDemoMovementDriver()
    : undefined, [config.animate]);
  React.useEffect(() => {
    if (!perfEnabled()) { return; }
    const benchmark = {
      active: demoMovementActive,
      config: () => ({
        cableCarriers: config.cableCarriers,
        trail: config.trail,
        waterFlow: config.waterFlow,
      }),
      moveTo: (position: PositionConfig) =>
        new Promise<void>(resolve => {
          startDemoMovement(position, resolve);
        }),
      position: getDemoMovementPosition,
      setWater: (enabled: boolean) => dispatch?.({
        type: Actions.DEMO_WRITE_PIN,
        payload: { pin: 8, mode: "digital", value: Number(enabled) },
      }),
    };
    window.__threeDBotBenchmark = benchmark;
    return () => {
      if (window.__threeDBotBenchmark == benchmark) {
        delete window.__threeDBotBenchmark;
      }
    };
  }, [config.cableCarriers, config.trail, config.waterFlow, dispatch]);
  const kinematics = getBotKinematics(config, springTarget, version);
  const configPosition = snapshotStore.getSnapshot();
  const trailReady = props.trailReady !== false;
  const jogPositions = getNativeJogControlPositions(config);
  const nativeJogWorld = (axis: "x" | "y" | "z") => {
    const currentKinematics = getBotKinematics(
      config,
      snapshotStore.getSnapshot(),
      version,
    );
    const { machineOrigin, gantryPosition, crossSlidePosition,
      zAxisPosition } = currentKinematics;
    const parentPositions = {
      x: [machineOrigin, gantryPosition],
      y: [machineOrigin, gantryPosition, crossSlidePosition],
      z: [
        machineOrigin,
        gantryPosition,
        crossSlidePosition,
        zAxisPosition,
      ],
    }[axis];
    const localPositions = axis == "x"
      ? jogPositions.x
      : [axis == "y" ? jogPositions.y : jogPositions.z];
    return {
      controlPositions: localPositions.map(position =>
        addBotPositions(...parentPositions, position)),
      utmPosition: currentKinematics.anchors.utm.worldPosition,
    };
  };
  const previewStates: Record<"x" | "y" | "z", NativeJogPreviewState> = {
    x: {
      preview: xJogPreview,
      setPreview: setXJogPreview,
      world: () => nativeJogWorld("x"),
    },
    y: {
      preview: yJogPreview,
      setPreview: setYJogPreview,
      world: () => nativeJogWorld("y"),
    },
    z: {
      preview: zJogPreview,
      setPreview: setZJogPreview,
      world: () => nativeJogWorld("z"),
    },
  };
  const jogProps = (
    name: string,
    axis: "x" | "y" | "z",
    position: [number, number, number],
  ) => ({
    axis,
    axisActions: props.axisActions,
    config,
    encoderData: props.encoderData,
    encoderVisibility: props.encoderVisibility,
    name,
    navigate: props.navigate,
    onClose: closeJogPopup,
    onSelect: () => setJogSelection({ name }),
    position,
    positionStore: snapshotStore,
    previewState: previewStates[axis],
    managePreviewLifecycle: name != "bot-jog-x-far",
    selected: axisActionsAvailable && jogSelection?.name == name,
  });
  const ghostTool = () => <Tools
    config={config}
    configPosition={configPosition}
    toolSlots={props.toolSlots}
    mountedToolName={props.mountedToolName}
    getZ={props.getZ}
    frame={"z-axis"} />;

  return <WaterFlowTextureProvider waterFlow={config.waterFlow}>
    <FocusVisibilityGroup name={"bot"}
      userData={{ [SECTION_FAR_CLIPPING_EXEMPT]: true }}
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
        <Group ref={gantry} name={"bot-gantry"}
          position={initialKinematics.gantryPosition}>
          <NativeJogControlPair {...jogProps(
            "bot-jog-x-near",
            "x",
            jogPositions.x[0],
          )} />
          <NativeJogControlPair {...jogProps(
            "bot-jog-x-far",
            "x",
            jogPositions.x[1],
          )} />
          <GantryAssembly
            config={config}
            configPosition={configPosition}
            version={version}
            columnShape={shapes.column}
            beamShape={shapes.beam}
            onSelectObject={props.onSelectObject}
            onHoverObject={props.onHoverObject} />
          {config.mirrorX
            ? <SnapshotGantryTools
              {...props}
              snapshotStore={snapshotStore} />
            : <Tools
              {...props}
              configPosition={configPosition}
              frame={"gantry"} />}
          <Group ref={crossSlide} name={"bot-cross-slide"}
            position={initialKinematics.crossSlidePosition}>
            <NativeJogControlPair {...jogProps(
              "bot-jog-y",
              "y",
              jogPositions.y,
            )} />
            <CrossSlideAssembly
              config={config}
              version={version}
              onSelectObject={props.onSelectObject}
              onHoverObject={props.onHoverObject} />
            <Group ref={zAxis} name={"bot-z-axis"}
              position={initialKinematics.zAxisPosition}>
              <NativeJogControlPair {...jogProps(
                "bot-jog-z",
                "z",
                jogPositions.z,
              )} />
              <ZAxisAssembly
                config={config}
                configPosition={configPosition}
                version={version}
                zAxisShape={shapes.zAxis}
                trailReady={trailReady}
                trailTarget={trailTarget}
                encoderData={props.encoderData}
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
      {(["x", "y", "z"] as const).map(axis =>
        previewStates[axis].preview &&
        <NativeJogWorldPreview
          key={axis}
          axis={axis}
          config={config}
          ghost={ghostTool()}
          name={`bot-jog-${axis}`}
          preview={previewStates[axis].preview}
          utmRef={zAxis} />)}
      <Group name={"bot-routing"} position={kinematics.machineOrigin}>
        <FrameRoutingAssembly
          config={config}
          configPosition={configPosition}
          positionRef={currentPosition}
          version={version} />
      </Group>
      <SnapshotAssemblies
        config={config}
        currentPosition={currentPosition}
        getZ={props.getZ}
        machineOrigin={kinematics.machineOrigin}
        snapshotStore={snapshotStore}
        version={version}
        onSelectObject={props.onSelectObject} />
    </FocusVisibilityGroup>
  </WaterFlowTextureProvider>;
};
