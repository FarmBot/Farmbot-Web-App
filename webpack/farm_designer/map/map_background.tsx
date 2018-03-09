import * as React from "react";
import { MapBackgroundProps } from "./interfaces";
import { Color } from "../../ui/index";

export function MapBackground(props: MapBackgroundProps) {
  const { mapTransformProps, plantAreaOffset } = props;
  const { gridSize } = mapTransformProps;
  const boardWidth = 20;
  const mapWidth = gridSize.x + plantAreaOffset.x * 2;
  const mapHeight = gridSize.y + plantAreaOffset.y * 2;
  return <g id="map-background">
    <defs>
      <pattern id="diagonalHatch"
        width={8} height={8} patternUnits="userSpaceOnUse">
        <path d="M-1,1 l4,-4 M0,8 l8,-8 M7,9 l4,-4" strokeWidth={0.5}
          stroke="rgba(0,0,0,0.07)" />
      </pattern>
    </defs>

    <rect id="bed-border"
      x={0} y={0} width={mapWidth} height={mapHeight}
      fill={Color.soilBackground} />
    <rect id="bed-interior" x={boardWidth / 2} y={boardWidth / 2}
      width={mapWidth - boardWidth} height={mapHeight - boardWidth}
      stroke="rgba(120,63,4,0.25)" strokeWidth={boardWidth}
      fill={Color.soilBackground} />
    <rect id="no-access-perimeter" x={boardWidth} y={boardWidth}
      width={mapWidth - boardWidth * 2} height={mapHeight - boardWidth * 2}
      fill="url(#diagonalHatch)" />
    <rect id="grid-fill" x={plantAreaOffset.x} y={plantAreaOffset.y}
      width={gridSize.x} height={gridSize.y} fill={Color.gridSoil} />
  </g>;
}
