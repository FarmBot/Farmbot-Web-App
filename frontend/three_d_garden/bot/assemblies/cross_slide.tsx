import React from "react";
import { ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import { Config } from "../../config";
import { ASSETS, HOVER_OBJECT_MODES, LIB_DIR } from "../../constants";
import { Group } from "../../components";
import {
  CrossSlideFull, CrossSlideModel, CrossSlideV19Full, CrossSlideV19Model,
  VacuumPumpCoverFull, VacuumPumpCoverModel,
} from "../parts";
import { Camera } from "../components";
import {
  ThreeDObjectHoverHandler, ThreeDObjectSelectionHandler,
} from "../../selection_types";
import { BotVersion } from "../bot_versions";
import { clickWasDragged } from "../../click_event";
import { Mode } from "../../../farm_designer/map/interfaces";
import { getMode } from "../../../farm_designer/map/util";

export interface CrossSlideAssemblyProps {
  config: Config;
  version: BotVersion;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
}

const CrossSlideMountedVacuumCover = (props: {
  position: [number, number, number];
}) => {
  const model = useGLTF(
    ASSETS.models.vacuumPumpCover,
    LIB_DIR,
  ) as unknown as VacuumPumpCoverFull;
  return <VacuumPumpCoverModel
    model={model}
    rotation={[0, 0, -Math.PI / 2]}
    position={props.position} />;
};

const CrossSlideAssemblyBase = (props: CrossSlideAssemblyProps) => {
  const crossSlide = useGLTF(
    props.version.number == "v1.9"
      ? ASSETS.models.crossSlideV19
      : ASSETS.models.crossSlide,
    LIB_DIR,
  ) as GLTF;
  const selectCamera = (event: ThreeEvent<MouseEvent>) => {
    if (clickWasDragged(event)) { return; }
    if ([...HOVER_OBJECT_MODES, Mode.cameraSelection].includes(getMode())) {
      return;
    }
    if (props.onSelectObject) {
      props.onSelectObject({ kind: "camera", id: 0 }) !== false &&
        event.stopPropagation?.();
    }
  };
  const cameraEvents = {
    onClick: selectCamera,
    onPointerOver: () => props.onHoverObject?.(true),
    onPointerOut: () => props.onHoverObject?.(false),
  };
  const vacuumPosition: [number, number, number] = [
    3.5,
    props.version.number == "v1.9" ? 65 : 105,
    props.version.number == "v1.9"
      ? props.config.columnLength - props.config.zGantryOffset - 32
      : props.config.columnLength - props.config.zGantryOffset - 40,
  ];

  return <Group name={"cross-slide-assembly"}>
    {props.version.number == "v1.9"
      ? <Group name={"crossSlide"} rotation={[0, 0, Math.PI / 2]}>
        <CrossSlideV19Model
          model={crossSlide as unknown as CrossSlideV19Full} />
        <Group name={"camera"}
          {...cameraEvents}
          position={[-46, 87.5, -7.5]}
          rotation={[Math.PI, 0, 0]}>
          <Camera kitVersion={props.version.number} />
        </Group>
      </Group>
      : <CrossSlideModel
        model={crossSlide as unknown as CrossSlideFull}
        name={"crossSlide"}
        rotation={[0, 0, Math.PI / 2]} />}
    {props.version.number != "v1.7" &&
      <CrossSlideMountedVacuumCover position={vacuumPosition} />}
  </Group>;
};

export const CrossSlideAssembly = React.memo(
  CrossSlideAssemblyBase,
  (prev, next) =>
    prev.config.columnLength === next.config.columnLength &&
    prev.config.zGantryOffset === next.config.zGantryOffset &&
    prev.version === next.version &&
    prev.onSelectObject === next.onSelectObject &&
    prev.onHoverObject === next.onHoverObject,
);
