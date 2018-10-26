import * as React from "react";
import { MapBackgroundProps } from "../interfaces";
import { Color } from "../../../ui/index";
import { getMapSize } from "../util";

export function MapBackground(props: MapBackgroundProps) {
  const { mapTransformProps, plantAreaOffset, templateView } = props;
  const { gridSize, xySwap } = mapTransformProps;
  const gridSizeW = xySwap ? gridSize.y : gridSize.x;
  const gridSizeH = xySwap ? gridSize.x : gridSize.y;
  const boardWidth = 20;
  const mapSize = getMapSize(mapTransformProps, plantAreaOffset);
  const bkgdColor = templateView ? Color.templateSoilBkgd : Color.soilBackground;
  const fillColor = templateView ? Color.templateGridSoil : Color.gridSoil;
  const edgeColor = templateView ? "rgba(0,0,0,0.25)" : "rgba(120,63,4,0.25)";
  return <g id="map-background">
    <defs>
      <pattern id="diagonalHatch"
        width={8} height={8} patternUnits="userSpaceOnUse">
        <path d="M-1,1 l4,-4 M0,8 l8,-8 M7,9 l4,-4" strokeWidth={0.5}
          stroke="rgba(0,0,0,0.07)" />
      </pattern>
    </defs>

    <rect id="bed-border"
      x={0} y={0} width={mapSize.w} height={mapSize.h}
      fill={bkgdColor} />
    <rect id="bed-interior" x={boardWidth / 2} y={boardWidth / 2}
      width={mapSize.w - boardWidth} height={mapSize.h - boardWidth}
      stroke={edgeColor} strokeWidth={boardWidth}
      fill={bkgdColor} />
    <rect id="no-access-perimeter" x={boardWidth} y={boardWidth}
      width={mapSize.w - boardWidth * 2} height={mapSize.h - boardWidth * 2}
      fill="url(#diagonalHatch)" />
    <rect id="grid-fill" x={plantAreaOffset.x} y={plantAreaOffset.y}
      width={gridSizeW} height={gridSizeH} fill={fillColor} />
  </g>;
}
