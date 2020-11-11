import React from "react";
import { isUndefined } from "lodash";
import { Color } from "../../../ui";
import { getMapSize, round, transformXY } from "../util";
import { ProfileLineProps } from "./interfaces";
import { Actions } from "../../../constants";
import { AxisNumberProperty } from "../interfaces";

/** Indicate map region used to develop the currently viewed profile. */
export const ProfileLine = (props: ProfileLineProps) => {
  const { plantAreaOffset, mapTransformProps, designer, botPosition } = props;
  const {
    profileOpen, profileAxis, profilePosition, profileWidth, profileFollowBot,
  } = designer;
  const mapSize = getMapSize(mapTransformProps, plantAreaOffset);
  const { xySwap } = mapTransformProps;
  const standardAxis = xySwap ? "y" : "x";
  const { x, y } = profileFollowBot ? botPosition : profilePosition;
  if (!profileOpen || isUndefined(x) || isUndefined(y)) {
    return <g id={"profile-line"} />;
  }
  const { qx, qy } = transformXY(round(x), round(y), mapTransformProps);
  return <g id={"profile-line"} fill={Color.magenta} fillOpacity={0.5}
    stroke={Color.magenta} strokeOpacity={0.75} strokeWidth={3}>
    {profileAxis == standardAxis
      ? <rect x={qx - profileWidth / 2} y={-plantAreaOffset.y}
        width={profileWidth} height={mapSize.h} />
      : <rect x={-plantAreaOffset.x} y={qy - profileWidth / 2}
        width={mapSize.w} height={profileWidth} />}
  </g>;
};

/** Choose a profile location. */
export const chooseProfile = (props: {
  gardenCoords: AxisNumberProperty | undefined,
  dispatch: Function,
}) => {
  if (props.gardenCoords) {
    props.dispatch({
      type: Actions.SET_PROFILE_POSITION,
      payload: { x: props.gardenCoords.x, y: props.gardenCoords.y, z: 0 }
    });
  }
};
