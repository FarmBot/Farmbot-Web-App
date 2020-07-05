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
const isRotated = (annotation: string | undefined, noCalib: boolean) => {
  if (PRE_CALIBRATION_PREVIEW && noCalib) { return true; }
  return annotation &&
    (annotation.includes("rotated")
      || annotation.includes("marked")
      || annotation.includes("calibration_result"));
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
  onLoad: (img: HTMLImageElement) => () => void,
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

/** Determine additional translation required when map is rotated. */
const xySwapAdjustment = (imageOrigin: string) => {
  switch (imageOrigin) {
    case "BOTTOM_RIGHT":
      return { x: -1, y: -1 };
    case "BOTTOM_LEFT":
      return { x: -1, y: 1 };
    case "TOP_RIGHT":
      return { x: 1, y: -1 };
    case "TOP_LEFT":
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
  const originAdjust = originAdjustment(imageOrigin);
  const quadrantAdjust = quadrantAdjustment(quadrant);
  const flip = {
    x: originAdjust.x * quadrantAdjust.x,
    y: originAdjust.y * quadrantAdjust.y,
  };
  const toZero = {
    x: originAdjust.x < 0 ? -size.x : 0,
    y: originAdjust.y < 0 ? -size.y : 0,
  };
  const translate = {
    x: round(flip.x * qx + toZero.x, PRECISION),
    y: round(flip.y * qy + toZero.y, PRECISION),
  };
  const xySwapAdjust = xySwapAdjustment(imageOrigin);
  const xySwapT = {
    x: xySwapAdjust.x > 0 ? size.x : size.y,
    y: xySwapAdjust.y > 0 ? size.y : size.x,
  };
  const xySwapTransform = xySwap
    ? ` rotate(90) scale(${-1}, ${1}) translate(${-xySwapT.x}, ${-xySwapT.y})`
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
  imageRotation: number | undefined;
}

/** If calibration data exists, parse it, usually to a number.
 * Otherwise, return values for pre-calibration preview. */
const parseCalibrationData =
  (props: CameraCalibrationData): ParsedCalibrationData => {
    const { scale, offset, origin, rotation } = props;
    const noCalib = PRE_CALIBRATION_PREVIEW && !parse(scale);
    const imageScale = noCalib ? 0.6 : parse(scale);
    const imageOffsetX = noCalib ? 0 : parse(offset.x);
    const imageOffsetY = noCalib ? 0 : parse(offset.y);
    const cleanOrigin = origin ? origin.split("\"").join("") : undefined;
    const imageOrigin = noCalib ? "TOP_LEFT" : cleanOrigin;
    const imageRotation = noCalib ? 0 : parse(rotation);
    return {
      noCalib, imageScale, imageOffsetX, imageOffsetY, imageOrigin,
      imageRotation,
    };
  };

export interface MapImageProps {
  image: TaggedImage | undefined;
  cameraCalibrationData: CameraCalibrationData;
  cropImage: boolean;
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
    const { image, cameraCalibrationData, mapTransformProps, cropImage,
    } = this.props;
    const { noCalib, imageScale, imageRotation } =
      parseCalibrationData(cameraCalibrationData);
    const { calibrationZ } = cameraCalibrationData;

    /* Check if the image exists. */
    if (image && !image.body.attachment_url.includes("placehold")) {
      const imageUrl = image.body.attachment_url;
      const { x, y, z } = image.body.meta;
      getImageSize(imageUrl, this.imageCallback);
      const { width, height } = this.state;

      /* Check for necessary camera calibration and image data. */
      if (imageScale && cameraZCheck(z, calibrationZ) &&
        isRotated(image.body.meta.name, noCalib)) {
        const imagePosition = mapImagePositionData({
          x, y, width, height, cameraCalibrationData, mapTransformProps,
        });
        if (imagePosition) {
          return <g id={`image-${image.body.id}`}>
            <CropClipPaths imageId={image.body.id}
              width={width} height={height}
              scale={imageScale} rotation={imageRotation} />
            <image
              xlinkHref={imageUrl}
              x={0} y={0}
              height={imagePosition.height} width={imagePosition.width}
              transform={imagePosition.transform}
              clipPath={cropPath(cropImage, imageRotation, image.body.id)} />
          </g>;
        }
      }
    }
    return <image />;
  }
}

export interface MapImagePositionDataProps {
  x: number | undefined;
  y: number | undefined;
  width: number;
  height: number;
  cameraCalibrationData: CameraCalibrationData;
  mapTransformProps: MapTransformProps;
}

export const mapImagePositionData = (props: MapImagePositionDataProps) => {
  const { x, y, width, height, cameraCalibrationData } = props;
  const {
    imageScale, imageOffsetX, imageOffsetY, imageOrigin,
  } = parseCalibrationData(cameraCalibrationData);
  if (isNumber(x) && isNumber(y) && height > 0 && width > 0 &&
    isNumber(imageScale) && imageScale > 0 &&
    isNumber(imageOffsetX) && isNumber(imageOffsetY) && imageOrigin) {
    /* Use pixel to coordinate scale to scale image. */
    const size = { x: width * imageScale, y: height * imageScale };
    const center = { x: size.x / 2, y: size.y / 2 };
    const o = { // Coordinates of top left corner of image for placement
      x: x + imageOffsetX - center.x,
      y: y + imageOffsetY - center.y,
    };
    const qCoords = transformXY(o.x, o.y, props.mapTransformProps);
    const { quadrant, xySwap } = props.mapTransformProps;
    const transformProps = { quadrant, qCoords, size, imageOrigin, xySwap };
    return {
      height: size.y, width: size.x, transform: transform(transformProps),
    };
  }
};

export const closestRotation = (angle: number) => {
  const remainder = Math.abs(angle % 90);
  return remainder > 45 ? 90 - remainder : remainder;
};

export const largeCrop = (angle: number) => closestRotation(angle) > 40;

export const cropAmount = (
  angle: number | undefined,
  size: Record<"width" | "height", number>,
): number => {
  const absAngle = closestRotation(angle || 0);
  if (absAngle > 0) {
    const factor = (5.61 - 0.095 * absAngle ** 2 + 9.06 * absAngle) / 640;
    const longEdge = Math.max(size.width, size.height);
    return round(longEdge * factor);
  }
  return 0;
};

interface CropClipPathsProps {
  imageId: number | undefined;
  width: number;
  height: number;
  scale: number;
  rotation: number | undefined;
}

const CropClipPaths = (props: CropClipPathsProps) => {
  const { imageId, width, height, scale, rotation } = props;
  /* Use pixel to coordinate scale to scale image. */
  const size = { x: width * scale, y: height * scale };
  const center = { x: size.x / 2, y: size.y / 2 };
  const narrow = Math.min(center.x, center.y);
  const long = Math.max(center.x, center.y);
  const crop = round(cropAmount(rotation, { width, height }) * scale);
  return <g id={"crop-clip-paths"}>
    <clipPath id={`circle-${imageId}`}>
      <circle r={narrow} cx={long} cy={narrow} />
    </clipPath>
    <clipPath id={`rectangle-${imageId}`}>
      <rect x={crop / 2} y={crop / 2}
        width={size.x - crop} height={size.y - crop} />
    </clipPath>
  </g>;
};

const cropPath = (
  cropImage: boolean,
  rotation: number | undefined,
  imageId: number | undefined,
) => {
  if (cropImage && rotation) {
    const shape = largeCrop(rotation) ? "circle" : "rectangle";
    return `url(#${shape}-${imageId})`;
  }
  return "none";
};
