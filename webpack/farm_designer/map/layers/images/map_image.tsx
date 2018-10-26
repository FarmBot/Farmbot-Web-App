import * as React from "react";
import { TaggedImage } from "farmbot";
import { CameraCalibrationData, BotOriginQuadrant } from "../../../interfaces";
import { MapTransformProps } from "../../interfaces";
import { transformXY } from "../../util";
import { isNumber, round } from "lodash";

const PRECISION = 3; // Number of decimals for image placement coordinates

/* Parse floats in camera calibration environment variables. */
const parse = (str: string | undefined) => {
  const parsed = str ? parseFloat(str) : NaN;
  return !isNaN(parsed) ? parsed : undefined;
};

/* Check if the image has been rotated according to the calibration value. */
const isRotated = (name: string | undefined) => {
  return name &&
    (name.includes("rotated")
      || name.includes("marked")
      || name.includes("calibration_result"));
};

/* Check if the calibration data is valid for the image provided using z. */
const cameraZCheck =
  (imageZ: number | undefined, calibZ: string | undefined) => {
    const calibrationZ = parse(calibZ);
    return isNumber(imageZ) && isNumber(calibrationZ) &&
      Math.abs(imageZ - calibrationZ) < 5;
  };

interface ImageSize {
  width: number;
  height: number;
}

/* Get the size of the image at the URL. Allow overriding for tests. */
const getImageSize = (url: string, size?: ImageSize): ImageSize => {
  if (url.includes("placehold")) { return { width: 0, height: 0 }; }
  if (size) { return size; }
  const imageData = new Image();
  imageData.src = url;
  return {
    height: imageData.height,
    width: imageData.width
  };
};

/* Flip (mirror) image based on orientation of camera. */
const originAdjustment = (imageOrigin: string) => {
  switch (imageOrigin) {
    case "BOTTOM_RIGHT":
      return { x: -1, y: -1 };
    case "BOTTOM_LEFT":
      return { x: 1, y: -1 };
    case "TOP_RIGHT":
      return { x: -1, y: 1 };
    case "TOP_LEFT":
    default:
      return { x: 1, y: 1 };
  }
};

/* Flip (mirror) image based on map quadrant. */
const quadrantAdjustment = (quadrant: BotOriginQuadrant) => {
  switch (quadrant) {
    case 1:
      return { x: -1, y: 1 };
    case 3:
      return { x: 1, y: -1 };
    case 4:
      return { x: -1, y: -1 };
    case 2:
    default:
      return { x: 1, y: 1 };
  }
};

interface TransformProps {
  quadrant: BotOriginQuadrant;
  qCoords: { qx: number, qy: number };
  size: { x: number, y: number };
  imageOrigin: string;
  xySwap: boolean;
}

/* Image transform string. Flip and place image at the correct map location. */
const transform = (props: TransformProps): string => {
  const { quadrant, qCoords, size, imageOrigin, xySwap } = props;
  const { qx, qy } = qCoords;
  const orginAdjusted = originAdjustment(imageOrigin);
  const quadrantAdjusted = quadrantAdjustment(quadrant);
  const flip = {
    x: orginAdjusted.x * quadrantAdjusted.x,
    y: orginAdjusted.y * quadrantAdjusted.y
  };
  const toZero = {
    x: orginAdjusted.x < 0 ? -size.x : 0,
    y: orginAdjusted.y < 0 ? -size.y : 0
  };
  const translate = {
    x: round(flip.x * qx + toZero.x, PRECISION),
    y: round(flip.y * qy + toZero.y, PRECISION)
  };
  const xySwapTransform = xySwap
    ? ` rotate(90) scale(${-1}, ${1}) translate(${-size.y}, ${-size.y})`
    : "";
  return `scale(${flip.x}, ${flip.y}) translate(${translate.x}, ${translate.y})`
    + xySwapTransform;
};

export interface MapImageProps {
  image: TaggedImage | undefined;
  cameraCalibrationData: CameraCalibrationData;
  mapTransformProps: MapTransformProps;
  sizeOverride?: ImageSize;
}

/*
 * Place the camera image in the Farm Designer map.
 * Assume the image that is provided from the Farmware is rotated correctly.
 * Require camera calibration data to display the image.
 */
export function MapImage(props: MapImageProps) {
  const { image, cameraCalibrationData, sizeOverride } = props;
  const { scale, offset, origin, calibrationZ } = cameraCalibrationData;
  const imageScale = parse(scale);
  const imageOffsetX = parse(offset.x);
  const imageOffsetY = parse(offset.y);
  const imageOrigin = origin ? origin.split("\"").join("") : undefined;
  const { quadrant, xySwap } = props.mapTransformProps;

  /* Check if the image exists. */
  if (image) {
    const imageUrl = image.body.attachment_url;
    const { x, y, z } = image.body.meta;
    const imageAnnotation = image.body.meta.name;
    const { width, height } = getImageSize(imageUrl, sizeOverride);

    /* Check for all necessary camera calibration and image data. */
    if (isNumber(x) && isNumber(y) && height > 0 && width > 0 &&
      isNumber(imageScale) && imageScale > 0 &&
      cameraZCheck(z, calibrationZ) && isRotated(imageAnnotation) &&
      isNumber(imageOffsetX) && isNumber(imageOffsetY) && imageOrigin) {
      /* Use pixel to coordinate scale to scale image. */
      const size = { x: width * imageScale, y: height * imageScale };
      const o = { // Coordinates of top left corner of image for placement
        x: x + imageOffsetX - size.x / 2,
        y: y + imageOffsetY - size.y / 2
      };
      const qCoords = transformXY(o.x, o.y, props.mapTransformProps);
      const transformProps = { quadrant, qCoords, size, imageOrigin, xySwap };
      return <image
        xlinkHref={imageUrl}
        height={size.y} width={size.x} x={0} y={0}
        transform={transform(transformProps)} />;
    }
  }
  return <image />;
}
