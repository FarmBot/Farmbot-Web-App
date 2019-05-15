import * as React from "react";
import { TaggedImage } from "farmbot";
import { CameraCalibrationData, BotOriginQuadrant } from "../../../interfaces";
import { MapTransformProps } from "../../interfaces";
import { transformXY } from "../../util";
import { isNumber, round } from "lodash";
import { equals } from "../../../../util";

const PRECISION = 3; // Number of decimals for image placement coordinates
/** Show all images roughly on map when no calibration values are present. */
const PRE_CALIBRATION_PREVIEW = true;

/* Parse floats in camera calibration environment variables. */
const parse = (str: string | undefined) => {
  const parsed = str ? parseFloat(str) : NaN;
  return !isNaN(parsed) ? parsed : undefined;
};

/* Check if the image has been rotated according to the calibration value. */
const isRotated = (name: string | undefined, noCalib: boolean) => {
  if (PRE_CALIBRATION_PREVIEW && noCalib) { return true; }
  return name &&
    (name.includes("rotated")
      || name.includes("marked")
      || name.includes("calibration_result"));
};

/* Check if the calibration data is valid for the image provided using z. */
const cameraZCheck =
  (imageZ: number | undefined, calibZ: string | undefined) => {
    if (PRE_CALIBRATION_PREVIEW && !calibZ) { return true; }
    const calibrationZ = parse(calibZ);
    return isNumber(imageZ) && isNumber(calibrationZ) &&
      Math.abs(imageZ - calibrationZ) < 5;
  };

/* Get the size of the image at the URL. */
const getImageSize = (
  url: string,
  onLoad: (img: HTMLImageElement) => () => void
): void => {
  const imageData = new Image();
  imageData.src = url;
  imageData.onload = onLoad(imageData);
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

interface ParsedCalibrationData {
  noCalib: boolean;
  imageScale: number | undefined;
  imageOffsetX: number | undefined;
  imageOffsetY: number | undefined;
  imageOrigin: string | undefined;
}

/** If calibration data exists, parse it, usually to a number.
 * Otherwise, return values for pre-calibration preview. */
const parseCalibrationData =
  (props: CameraCalibrationData): ParsedCalibrationData => {
    const { scale, offset, origin } = props;
    const noCalib = PRE_CALIBRATION_PREVIEW && !parse(scale);
    const imageScale = noCalib ? 0.6 : parse(scale);
    const imageOffsetX = noCalib ? 0 : parse(offset.x);
    const imageOffsetY = noCalib ? 0 : parse(offset.y);
    const cleanOrigin = origin ? origin.split("\"").join("") : undefined;
    const imageOrigin = noCalib ? "TOP_LEFT" : cleanOrigin;
    return { noCalib, imageScale, imageOffsetX, imageOffsetY, imageOrigin };
  };

export interface MapImageProps {
  image: TaggedImage | undefined;
  cameraCalibrationData: CameraCalibrationData;
  mapTransformProps: MapTransformProps;
}

interface MapImageState {
  width: number;
  height: number;
}

/*
 * Place the camera image in the Farm Designer map.
 * Assume the image that is provided from the Farmware is rotated correctly.
 * Require camera calibration data to display the image.
 */
export class MapImage extends React.Component<MapImageProps, MapImageState> {
  state: MapImageState = { width: 0, height: 0 };

  shouldComponentUpdate(nextProps: MapImageProps, nextState: MapImageState) {
    const propsChanged = !equals(this.props, nextProps);
    const stateChanged = !equals(this.state, nextState);
    return propsChanged || stateChanged;
  }

  imageCallback = (img: HTMLImageElement) => () => {
    const { width, height } = img;
    this.setState({ width, height });
  };

  render() {
    const { image, cameraCalibrationData } = this.props;
    const {
      noCalib, imageScale, imageOffsetX, imageOffsetY, imageOrigin
    } = parseCalibrationData(cameraCalibrationData);
    const { calibrationZ } = cameraCalibrationData;
    const { quadrant, xySwap } = this.props.mapTransformProps;

    /* Check if the image exists. */
    if (image && !image.body.attachment_url.includes("placehold")) {
      const imageUrl = image.body.attachment_url;
      const { x, y, z } = image.body.meta;
      const imageAnnotation = image.body.meta.name;
      getImageSize(imageUrl, this.imageCallback);
      const { width, height } = this.state;

      /* Check for all necessary camera calibration and image data. */
      if (isNumber(x) && isNumber(y) && height > 0 && width > 0 &&
        isNumber(imageScale) && imageScale > 0 &&
        cameraZCheck(z, calibrationZ) && isRotated(imageAnnotation, noCalib) &&
        isNumber(imageOffsetX) && isNumber(imageOffsetY) && imageOrigin) {
        /* Use pixel to coordinate scale to scale image. */
        const size = { x: width * imageScale, y: height * imageScale };
        const o = { // Coordinates of top left corner of image for placement
          x: x + imageOffsetX - size.x / 2,
          y: y + imageOffsetY - size.y / 2
        };
        const qCoords = transformXY(o.x, o.y, this.props.mapTransformProps);
        const transformProps = { quadrant, qCoords, size, imageOrigin, xySwap };
        return <image
          xlinkHref={imageUrl}
          height={size.y} width={size.x} x={0} y={0}
          transform={transform(transformProps)} />;
      }
    }
    return <image />;
  }
}
