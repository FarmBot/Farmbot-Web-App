import React from "react";
import { TaggedGenericPointer, Xyz } from "farmbot";
import { GardenPoint } from "./garden_point";
import { MapTransformProps, Mode } from "../../interfaces";
import { CameraCalibrationData, DesignerState } from "../../../interfaces";
import { getSoilHeightColor } from "../../../../points/soil_height";
import { getMode, transformXY } from "../../util";
import { range, sortBy } from "lodash";
import { findNearest } from "../../../../point_groups/paths";
import { groupItemsByLocation } from "../../../location_info";

export interface PointLayerProps {
  visible: boolean;
  genericPoints: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  interactions: boolean;
  cameraCalibrationData: CameraCalibrationData;
  cropPhotos: boolean;
  designer: DesignerState;
}

interface InterpolationData {
  data: Record<Xyz, number>[];
  hash: string;
}

const INTERPOLATION_DATA: InterpolationData = { data: [], hash: "" };

export function PointLayer(props: PointLayerProps) {
  const { visible, genericPoints, mapTransformProps, designer } = props;
  const { cameraViewGridId, hoveredPoint, gridIds, soilHeightLabels } = designer;
  const getColor = getSoilHeightColor(genericPoints);
  const style: React.CSSProperties =
    props.interactions ? {} : { pointerEvents: "none" };
  const stepSize = parseInt(localStorage.getItem("interpolation_step") || "25");
  generateData({ genericPoints, mapTransformProps, getColor, stepSize });
  return <g id={"point-layer"} style={style}>
    {visible && getMode() == Mode.locationInfo &&
      <InterpolationMap
        genericPoints={genericPoints}
        getColor={getColor}
        mapTransformProps={mapTransformProps}
        stepSize={stepSize} />}
    {visible &&
      genericPoints.filter(p => !p.body.meta.gridId
        || gridIds.length == 0
        || !gridIds.includes(p.body.meta.gridId))
        .map(p =>
          <GardenPoint
            point={p}
            key={p.uuid}
            hovered={hoveredPoint == p.uuid}
            cameraViewGridId={cameraViewGridId}
            cameraCalibrationData={props.cameraCalibrationData}
            cropPhotos={props.cropPhotos}
            dispatch={props.dispatch}
            soilHeightLabels={soilHeightLabels}
            getSoilHeightColor={getColor}
            mapTransformProps={mapTransformProps} />)}
  </g>;
}

interface InterpolationMapProps {
  genericPoints: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
  getColor(z: number): string;
  stepSize: number;
}

const InterpolationMap = (props: InterpolationMapProps) => {
  const step = props.stepSize;
  return <g id={"interpolation-map"}>
    {INTERPOLATION_DATA["data"].map(p => {
      const { x, y, z } = p;
      const { qx, qy } = transformXY(x, y, props.mapTransformProps);
      return <rect key={`${x}-${y}`}
        x={qx - step / 2} y={qy - step / 2} width={step} height={step}
        fill={props.getColor(z)} fillOpacity={0.85} />;
    })}
  </g>;
};

interface GenerateInterpolationMapDataProps {
  genericPoints: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
  getColor(z: number): string;
  stepSize: number;
}

const generateData = (props: GenerateInterpolationMapDataProps) => {
  const soilHeightPoints = sortBy(groupItemsByLocation(props.genericPoints
    .filter(p => p.body.meta.at_soil_level), undefined), "points.body.created_at")
    .map(data => data.items[0]);
  const gridX = props.mapTransformProps.gridSize.x;
  const gridY = props.mapTransformProps.gridSize.y;
  const step = props.stepSize;
  const useWeights = localStorage.getItem("interpolation") == "weights";
  const hash = [
    JSON.stringify(soilHeightPoints), gridX, gridY, step, useWeights,
  ].join("");
  if (INTERPOLATION_DATA["hash"] == hash) { return; }
  const data: Record<Xyz, number>[] = [];
  range(0, gridX, step).map(x =>
    range(0, gridY, step).map(y => {
      if (soilHeightPoints.length > 0) {
        const nearest = findNearest({ x, y }, soilHeightPoints);
        data.push({ x, y, z: nearest.body.z });
      }
    }));
  INTERPOLATION_DATA["data"] = data;
  INTERPOLATION_DATA["hash"] = hash;
};
