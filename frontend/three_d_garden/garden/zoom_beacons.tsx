import { Sphere, Html, Line } from "@react-three/drei";
import React from "react";
import { Config, PositionConfig } from "../config";
import { FOCI, getCameraOffset, setUrlParam } from "../zoom_beacons_constants";
import { animated, useSpring } from "@react-spring/three";
import { SpringValue, to } from "@react-spring/core";
import { Group, MeshPhongMaterial, Mesh } from "../components";
import { isDesktop } from "../../screen_size";
import { RenderOrder } from "../constants";
import {
  easeInOutCubic, useFocusTransition, useFocusVisibilityClass,
} from "../focus_transition";

const beaconColor = "#0266b5";

const AnimatedMesh = animated(Mesh);
const AnimatedGroup = animated(Group);
const AnimatedMeshPhongMaterial = animated(MeshPhongMaterial);
type Focus = ReturnType<typeof FOCI>[number];

export interface ZoomBeaconsProps {
  config: Config;
  configPosition: PositionConfig;
  activeFocus: string;
  setActiveFocus(focus: string): void;
  loadInOpacity?: SpringValue<number>;
  loadInScale?: SpringValue<number> | number;
}

interface BeaconPulseProps {
  beaconSize: number;
  animate: boolean;
  parentOpacity: SpringValue<number>;
}

const BeaconPulse = (props: BeaconPulseProps) => {
  const { beaconSize, animate, parentOpacity } = props;
  const { scale, opacity } = useSpring({
    from: { scale: 1, opacity: 0.75 },
    to: async (next) => {
      while (animate) {
        await next({ scale: 2.5, opacity: 0 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        await next({ scale: 1, opacity: 0.75, immediate: true });
      }
    },
    config: { duration: 1500 }
  });

  return <AnimatedMesh scale={scale}>
    <Sphere args={[beaconSize, 12, 12]}
      renderOrder={RenderOrder.beacons}>
      <AnimatedMeshPhongMaterial
        color={beaconColor}
        opacity={to([opacity, parentOpacity], (pulse, parent) =>
          pulse * parent)}
        depthWrite={false}
        transparent={true} />
    </Sphere>
  </AnimatedMesh>;
};

interface BeaconVisualProps {
  activeFocus: string;
  beaconSize: number;
  hovered: boolean;
  onClick(): void;
  onPointerEnter(): void;
  onPointerLeave(): void;
  config: Config;
  loadInOpacity?: SpringValue<number>;
  loadInScale?: SpringValue<number> | number;
}

const BeaconVisual = (props: BeaconVisualProps) => {
  const transition = useFocusTransition();
  const visible = !props.activeFocus;
  const [rendered, setRendered] = React.useState(visible);
  const { opacity } = useSpring({
    opacity: visible ? 1 : 0,
    immediate: !transition.enabled,
    config: {
      duration: transition.duration,
      easing: easeInOutCubic,
    },
    onRest: () => {
      if (transition.enabled && !visible) {
        setRendered(false);
      }
    },
  });

  React.useEffect(() => {
    if (transition.enabled && visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRendered(true);
    }
  }, [transition.enabled, visible]);

  if (!rendered && !visible) { return undefined; }
  const beaconOpacity = props.loadInOpacity
    ? to([opacity, props.loadInOpacity], (focus, load) => focus * load)
    : opacity;

  return <AnimatedGroup name={"beacon-visual"}
    scale={props.loadInScale}>
    <Sphere name={"beacon-sphere"}
      renderOrder={RenderOrder.beacons}
      onClick={props.onClick}
      onPointerEnter={props.onPointerEnter}
      onPointerLeave={props.onPointerLeave}
      receiveShadow={false}
      castShadow={false}
      args={[
        props.beaconSize
        * (props.hovered ? 1.5 : 1)
        * ((!props.activeFocus && props.config.sizePreset == "Genesis XL")
          ? 1.5
          : 1),
        12,
        12,
      ]}>
      <AnimatedMeshPhongMaterial
        color={beaconColor}
        opacity={beaconOpacity}
        depthWrite={false}
        transparent={true} />
    </Sphere>
    <BeaconPulse
      beaconSize={props.beaconSize}
      animate={props.config.animate}
      parentOpacity={beaconOpacity as SpringValue<number>} />
  </AnimatedGroup>;
};

interface BeaconInfoProps {
  focus: Focus;
  active: boolean;
  onExit(): void;
}

const BeaconInfo = (props: BeaconInfoProps) => {
  const transition = useFocusVisibilityClass(props.active);
  if (!transition.mounted) { return undefined; }
  const className = [
    "beacon-info",
    "focus-transition-opacity",
    transition.className,
  ].join(" ");
  return <Html name={props.focus.label}
    wrapperClass={"beacon-info-wrapper"}
    center={true}
    rotation={[Math.PI / 2, 0, 0]}
    position={props.focus.info.position}
    distanceFactor={props.focus.info.scale}>
    <div className={className}
      onPointerDown={e => e.stopPropagation()}
      onPointerMove={e => e.stopPropagation()}>
      <div className="header">
        <h2>{props.focus.label}</h2>
        <div className="exit-button"
          onClick={props.onExit}>
          ❌
        </div>
      </div>
      {props.focus.info.description}
    </div>
  </Html>;
};

export const ZoomBeacons = (props: ZoomBeaconsProps) => {
  const [hoveredFocus, setHoveredFocus] = React.useState("");
  const { activeFocus, setActiveFocus } = props;
  const gardenBedDiv =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    document.querySelector(".garden-bed-3d-model") as HTMLElement | null;

  const beaconSize = isDesktop() ? 60 : 80;
  return <Group name={"zoom-beacons"}>
    {FOCI(props.config, props.configPosition).map(focus => {
      const camera = getCameraOffset(focus);
      const exitFocus = () => {
        setActiveFocus("");
        setUrlParam("focus", "");
      };
      const enterFocus = () => {
        if (activeFocus) { return; }
        setActiveFocus(focus.label);
        setUrlParam("focus", focus.label);
        setHoveredFocus("");
        if (gardenBedDiv) {
          gardenBedDiv.style.cursor = "";
        }
      };
      return <Group name={"zoom-beacon"} key={focus.label}
        position={focus.position}>
        {props.config.zoomBeaconDebug &&
          <Group name={"debug-group"}>
            <Sphere args={[30]} position={camera.position}
              material-color={"cyan"} />
            <Line points={[camera.position, camera.target]}
              color={"yellow"} lineWidth={2} />
            <Sphere args={[30]} position={camera.target}
              material-color={"orange"} />
          </Group>}
        <BeaconVisual
          activeFocus={activeFocus}
          beaconSize={beaconSize}
          config={props.config}
          hovered={hoveredFocus == focus.label}
          loadInOpacity={props.loadInOpacity}
          loadInScale={props.loadInScale}
          onClick={enterFocus}
          onPointerEnter={() => {
            if (activeFocus) { return; }
            setHoveredFocus(focus.label);
            if (gardenBedDiv) {
              gardenBedDiv.style.cursor = "zoom-in";
            }
          }}
          onPointerLeave={() => {
            setHoveredFocus("");
            if (gardenBedDiv) {
              gardenBedDiv.style.cursor = "";
            }
          }} />
        <BeaconInfo
          focus={focus}
          active={activeFocus == focus.label}
          onExit={exitFocus} />
      </Group>;
    })}
  </Group>;
};
