import React from "react";
import { TaggedFarmwareEnv, TaggedGenericPointer } from "farmbot";
import { GardenPoint } from "./garden_point";
import { MapTransformProps } from "../../interfaces";
import { CameraCalibrationData, DesignerState } from "../../../interfaces";
import {
  getSoilHeightColor, soilHeightPoint,
} from "../../../../points/soil_height";
import {
  fetchInterpolationOptions, generateData, InterpolationMap,
} from "./interpolation_map";
import { UUID } from "../../../../resources/interfaces";

export interface PointLayerProps {
  visible: boolean;
  overlayVisible: boolean;
  genericPoints: TaggedGenericPointer[];
  currentPoint: UUID | undefined;
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  interactions: boolean;
  cameraCalibrationData: CameraCalibrationData;
  cropPhotos: boolean;
  showUncroppedArea: boolean;
  designer: DesignerState;
  farmwareEnvs: TaggedFarmwareEnv[];
  animate: boolean;
}

export function PointLayer(props: PointLayerProps) {
  const { visible, genericPoints, mapTransformProps, designer } = props;
  const { cameraViewGridId, hoveredPoint, gridIds, soilHeightLabels } = designer;
  const soilHeightPoints = genericPoints.filter(soilHeightPoint);
  const getColor = getSoilHeightColor(soilHeightPoints);
  const style: React.CSSProperties =
    props.interactions ? {} : { pointerEvents: "none" };
  const options = fetchInterpolationOptions(props.farmwareEnvs);
  generateData({
    kind: "Point", points: soilHeightPoints, mapTransformProps, getColor, options,
  });
  return <g id={"point-layer"} style={style}>
    {props.overlayVisible &&
      <InterpolationMap
        kind={"Point"}
        points={soilHeightPoints}
        getColor={getColor}
        mapTransformProps={mapTransformProps}
        options={options} />}
    {visible &&
      genericPoints.filter(p => !p.body.meta.gridId
        || gridIds.length == 0
        || !gridIds.includes(p.body.meta.gridId))
        .map(p =>
          <GardenPoint
            point={p}
            key={p.uuid}
            current={props.currentPoint == p.uuid}
            hovered={hoveredPoint == p.uuid}
            cameraViewGridId={cameraViewGridId}
            cameraCalibrationData={props.cameraCalibrationData}
            cropPhotos={props.cropPhotos}
            showUncroppedArea={props.showUncroppedArea}
            dispatch={props.dispatch}
            soilHeightLabels={soilHeightLabels}
            getSoilHeightColor={getColor}
            animate={props.animate}
            mapTransformProps={mapTransformProps} />)}
  </g>;
}
