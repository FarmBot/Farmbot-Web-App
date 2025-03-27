import { Sphere, Html, Line } from "@react-three/drei";
import React from "react";
import { Config } from "../config";
import { FOCI, getCameraOffset, setUrlParam } from "../zoom_beacons_constants";
import { useSpring, animated } from "@react-spring/three";
import { Group, Mesh, MeshPhongMaterial } from "../components";
import { isDesktop } from "../../screen_size";
import { RenderOrder } from "../constants";

const beaconColor = "#0266b5";

const AnimatedMesh = animated(Mesh);
const AnimatedMeshPhongMaterial = animated(MeshPhongMaterial);

export interface ZoomBeaconsProps {
  config: Config;
  activeFocus: string;
  setActiveFocus(focus: string): void;
}

interface BeaconPulseProps {
  beaconSize: number;
  animate: boolean;
}

const BeaconPulse = (props: BeaconPulseProps) => {
  const { beaconSize, animate } = props;
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
        opacity={opacity}
        transparent={true} />
    </Sphere>
  </AnimatedMesh>;
};

export const ZoomBeacons = (props: ZoomBeaconsProps) => {
  const [hoveredFocus, setHoveredFocus] = React.useState("");
  const { activeFocus, setActiveFocus } = props;
  const gardenBedDiv =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    document.querySelector(".garden-bed-3d-model") as HTMLElement | null;

  const beaconSize = isDesktop() ? 60 : 80;
  return <Group name={"zoom-beacons"}>
    {FOCI(props.config).map(focus => {
      const camera = getCameraOffset(focus);
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
        <Sphere name={"beacon-sphere"}
          onClick={() => {
            setActiveFocus(activeFocus ? "" : focus.label);
            setUrlParam("focus", focus.label);
            setHoveredFocus("");
            if (gardenBedDiv) {
              gardenBedDiv.style.cursor = "";
            }
          }}
          onPointerEnter={() => {
            setHoveredFocus(focus.label);
            if (gardenBedDiv) {
              gardenBedDiv.style.cursor = activeFocus ? "zoom-out" : "zoom-in";
            }
          }}
          onPointerLeave={() => {
            setHoveredFocus("");
            if (gardenBedDiv) {
              gardenBedDiv.style.cursor = "";
            }
          }}
          receiveShadow={true}
          visible={!activeFocus}
          args={[
            beaconSize
            * (hoveredFocus == focus.label ? 1.5 : 1)
            * ((!activeFocus && props.config.sizePreset == "Genesis XL") ? 1.5 : 1),
            12,
            12,
          ]}>
          <MeshPhongMaterial color={beaconColor} />
        </Sphere>
        {!activeFocus &&
          <BeaconPulse beaconSize={beaconSize} animate={props.config.animate} />}
        {activeFocus == focus.label &&
          <Html name={focus.label}
            wrapperClass="beacon-info-wrapper"
            center={true}
            rotation={[Math.PI / 2, 0, 0]}
            position={focus.info.position}
            distanceFactor={focus.info.scale}>
            <div className="beacon-info"
              onPointerDown={e => e.stopPropagation()}
              onPointerMove={e => e.stopPropagation()}>
              <div className="header">
                <h2>{focus.label}</h2>
                <div className="exit-button"
                  onClick={() => {
                    setActiveFocus("");
                    setUrlParam("focus", "");
                  }}>
                  ❌
                </div>
              </div>
              {focus.info.description}
            </div>
          </Html>}
      </Group>;
    })}
  </Group>;
};
