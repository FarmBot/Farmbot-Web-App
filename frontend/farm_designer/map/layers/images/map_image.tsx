import React from "react";
import { TaggedImage } from "farmbot";
import { CameraCalibrationData, BotOriginQuadrant } from "../../../interfaces";
import { MapTransformProps } from "../../interfaces";
import { transformXY } from "../../util";
import { isNumber, round, last } from "lodash";
import { equals } from "../../../../util";
import { Color } from "../../../../ui";

const PRECISION = 3; // Number of decimals for image placement coordinates

/* Parse floats in camera calibration environment variables. */
const parse = (str: string | undefined) => {
  const parsed = str ? parseFloat(str) : NaN;
  return !isNaN(parsed) ? parsed : undefined;
};

/* Check if the image has been rotated according to the calibration value. */
const isRotated = (annotation: string | undefined) => {
  return !!(annotation &&
    (annotation.includes("rotated")
      || annotation.includes("marked")
      || annotation.includes("calibration_result")));
};

/* Verify calibration camera z height matches the image provided. */
export const cameraZCheck =
  (imageZ: number | undefined, calibZ: string | undefined) => {
    if (!calibZ) { return true; }
    const calibrationZ = parse(calibZ);
    return isNumber(imageZ) && isNumber(calibrationZ) &&
      Math.abs(imageZ - calibrationZ) < 5;
  };

/* Check if the calibration image center matches the provided image. */
export const imageSizeCheck =
  (size: Record<"width" | "height", number | undefined>,
    calibCenter: Record<"x" | "y", string | undefined>,
  ) => {
    if (!calibCenter.x) { return true; }
    const calibrationCenter = {
      x: parse(calibCenter.x),
      y: parse(calibCenter.y),
    };
    return isNumber(calibrationCenter.x) && isNumber(calibrationCenter.y)
      && isNumber(size.width) && isNumber(size.height)
      && ((Math.abs(size.width / 2 - calibrationCenter.x) < 5
        && Math.abs(size.height / 2 - calibrationCenter.y) < 5)
        || (Math.abs(size.height / 2 - calibrationCenter.x) < 5
          && Math.abs(size.width / 2 - calibrationCenter.y) < 5));
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

/** Determine additional scale flip required when map is rotated. */
const xySwapFlip = (imageOrigin: string) => {
  switch (imageOrigin) {
    case "BOTTOM_RIGHT":
      return { x: -1, y: 1 };
    case "BOTTOM_LEFT":
      return { x: 1, y: -1 };
    case "TOP_RIGHT":
      return { x: 1, y: -1 };
    case "TOP_LEFT":
    default:
      return { x: -1, y: 1 };
  }
};

const rotateOrigin = (imageOrigin: string) => {
  switch (imageOrigin) {
    case "BOTTOM_RIGHT":
      return "TOP_LEFT";
    case "BOTTOM_LEFT":
      return "TOP_RIGHT";
    case "TOP_RIGHT":
      return "BOTTOM_LEFT";
    case "TOP_LEFT":
    default:
      return "BOTTOM_RIGHT";
  }
};

interface TransformProps {
  quadrant: BotOriginQuadrant;
  qCoords: { qx: number, qy: number };
  size: { x: number, y: number };
  imageOrigin: string;
  xySwap: boolean;
  rotate: number;
  noRotation?: boolean;
  rotated90?: boolean;
}

/* Image transform string. Flip and place image at the correct map location. */
const generateTransform = (props: TransformProps): string => {
  const {
    quadrant, qCoords, size, imageOrigin, xySwap, rotate,
  } = props;
  const { qx, qy } = qCoords;
  const originAdjust = originAdjustment(imageOrigin);
  const quadrantAdjust = quadrantAdjustment(quadrant);
  const flip = {
    x: originAdjust.x * quadrantAdjust.x,
    y: originAdjust.y * quadrantAdjust.y,
  };
  const toZero = {
    x: quadrantAdjust.x < 0 ? originAdjust.x * size.x : 0,
    y: quadrantAdjust.y < 0 ? originAdjust.y * size.y : 0,
  };
  const translate = {
    x: round(flip.x * qx + toZero.x, PRECISION),
    y: round(flip.y * qy + toZero.y, PRECISION),
  };
  const swapFlip = xySwapFlip(imageOrigin);
  const swapTranslationAmount = round(Math.abs(size.x - size.y) / 2, PRECISION);
  const swapRotateAdjust = props.rotated90 ? -1 : 1;
  const swapTranslate = {
    x: originAdjust.y * swapTranslationAmount * swapRotateAdjust,
    y: originAdjust.x * swapTranslationAmount * swapRotateAdjust,
  };
  return `scale(${flip.x}, ${flip.y})`
    + ` translate(${translate.x}px, ${translate.y}px)`
    + (xySwap ? ` scale(${swapFlip.x}, ${swapFlip.y})` : "")
    + (xySwap ? ` translate(${swapTranslate.x}px, ${swapTranslate.y}px)` : "")
    + ` rotate(${(xySwap && !props.noRotation ? 90 : 0) - rotate}deg)`;
};

interface ParsedCalibrationData {
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
    const imageScale = parse(scale) || 0.6;
    const imageOffsetX = parse(offset.x) ?? 0;
    const imageOffsetY = parse(offset.y) ?? 0;
    const cleanOrigin = origin ? origin.split("\"").join("") : undefined;
    const imageOrigin = cleanOrigin ?? "TOP_LEFT";
    const imageRotation = parse(rotation) ?? 0;
    return {
      imageScale, imageOffsetX, imageOffsetY, imageOrigin,
      imageRotation,
    };
  };

export interface MapImageProps {
  image: TaggedImage;
  hoveredMapImage: number | undefined;
  highlighted?: boolean;
  cameraCalibrationData: CameraCalibrationData;
  cropImage: boolean;
  mapTransformProps: MapTransformProps;
  callback?: (img: HTMLImageElement) => void;
  disableTranslation?: boolean;
}

interface MapImageState {
  imageWidth: number;
  imageHeight: number;
}

/**
 * Place the camera image in the Farm Designer map.
 * Assume pre-rotated images are rotated correctly.
 * Verify camera calibration data matches image data if calibration data exists.
 * Camera calibration data is required to properly position images, but
 * fallback values are used to preview images before calibration is performed.
 */
export class MapImage extends React.Component<MapImageProps, MapImageState> {
  state: MapImageState = { imageWidth: 0, imageHeight: 0 };

  shouldComponentUpdate(nextProps: MapImageProps, nextState: MapImageState) {
    const propsChanged = !equals(this.props, nextProps);
    const stateChanged = !equals(this.state, nextState);
    return propsChanged || stateChanged;
  }

  imageCallback = (img: HTMLImageElement) => () => {
    const { width, height } = img;
    this.setState({ imageWidth: width, imageHeight: height });
    this.props.callback?.(img);
  };

  render() {
    const { imageWidth, imageHeight } = this.state;
    const { image, cameraCalibrationData, mapTransformProps, cropImage,
    } = this.props;
    const imageRotation = parse(cameraCalibrationData.rotation) ?? 0;
    const { calibrationZ, center } = cameraCalibrationData;
    const imageMetaName = image.body.meta.name || "";
    const alreadyRotated = isRotated(imageMetaName);
    const imageUploadName = last(imageMetaName.split("/"));
    const { x, y, z } = image.body.meta;

    if (!image.body.attachment_url.includes("placehold")) {
      const imageUrl = image.body.attachment_url;
      getImageSize(imageUrl, this.imageCallback);

      /* Verify camera calibration data is valid for the image. */
      if (cameraZCheck(z, calibrationZ)
        && imageSizeCheck({ width: imageWidth, height: imageHeight }, center)) {
        const imagePosition = mapImagePositionData({
          x, y, width: imageWidth, height: imageHeight,
          cameraCalibrationData, mapTransformProps, alreadyRotated,
        });
        /** Position image if all required data is present. */
        if (imagePosition) {
          const { width, height, transformOrigin } = imagePosition;
          const transform = this.props.disableTranslation ?
            imagePosition.transform.replace(/translate\(.*?\)/g, "")
            : imagePosition.transform;
          const hovered = this.props.hoveredMapImage == image.body.id;
          const clipName = cropPathName(cropImage, imageRotation, image.body.id);
          return <g id={`image-${image.body.id}`}>
            {clipName != "none" && imageRotation &&
              <CropClipPaths imageId={image.body.id}
                width={width} height={height}
                transformOrigin={transformOrigin}
                rotation={imageRotation} alreadyRotated={alreadyRotated} />}
            {(hovered || this.props.highlighted) &&
              <rect id={"highlight-border"}
                x={0} y={0} height={height} width={width}
                stroke={Color.orange} strokeWidth={10}
                fill={Color.black} fillOpacity={0.75}
                style={{ transformOrigin, transform }} />}
            <image
              data-comment={`${imageUploadName}: ${imagePosition.comment}`}
              xlinkHref={imageUrl}
              x={0} y={0}
              height={height} width={width}
              style={{ transformOrigin, transform }}
              opacity={!this.props.hoveredMapImage || hovered ? 1 : 0.3}
              clipPath={clipName} />
          </g>;
        }
      }
    }
    return <image id={"image-not-shown"}
      data-comment={`${imageUploadName}: ${JSON.stringify({
        image: { x, y, z, imageWidth, imageHeight }, cameraCalibrationData,
      }).replace(/"/g, "")}`} />;
  }
}

interface MapImagePositionDataProps {
  x: number | undefined;
  y: number | undefined;
  width: number;
  height: number;
  cameraCalibrationData: CameraCalibrationData;
  mapTransformProps: MapTransformProps;
  alreadyRotated: boolean;
  noRotation?: boolean;
}

export interface MapImagePositionData {
  height: number;
  width: number;
  transform: string;
  transformOrigin: string;
  comment: string;
}

interface VerifyDataProps {
  x: number | undefined;
  y: number | undefined;
  width: number;
  height: number;
  imageScale: number | undefined;
  imageOffsetX: number | undefined;
  imageOffsetY: number | undefined;
  imageOrigin: string | undefined;
}

interface VerifiedData {
  x: number;
  y: number;
  width: number;
  height: number;
  imageScale: number;
  imageOffsetX: number;
  imageOffsetY: number;
  imageOrigin: string;
}

/* Verify camera calibration and image data meets requirements. */
const verifyData = (props: VerifyDataProps): VerifiedData | undefined => {
  const {
    x, y, width, height, imageScale, imageOffsetX, imageOffsetY, imageOrigin,
  } = props;
  if (isNumber(x) && isNumber(y) && height > 0 && width > 0 &&
    isNumber(imageScale) && imageScale > 0 &&
    isNumber(imageOffsetX) && isNumber(imageOffsetY) && imageOrigin) {
    return {
      x, y, width, height, imageScale, imageOffsetX, imageOffsetY, imageOrigin
    };
  }
};

export const mapImagePositionData = (props: MapImagePositionDataProps):
  MapImagePositionData | undefined => {
  const { cameraCalibrationData, alreadyRotated, noRotation } = props;
  const imageRotated = alreadyRotated && !noRotation;
  const parsed = parseCalibrationData(cameraCalibrationData);
  const rotated90 = rotated90degrees(parsed.imageRotation);
  const verifiedData = verifyData({
    x: props.x, y: props.y, width: props.width, height: props.height,
    imageScale: parsed.imageScale, imageOrigin: parsed.imageOrigin,
    imageOffsetX: parsed.imageOffsetX, imageOffsetY: parsed.imageOffsetY,
  });
  if (verifiedData) {
    const {
      x, y, width, height, imageScale, imageOffsetX, imageOffsetY, imageOrigin
    } = verifiedData;
    /* Use pixel to coordinate scale to scale image. */
    const size = {
      x: round(width * imageScale, PRECISION),
      y: round(height * imageScale, PRECISION),
    };
    const center = { x: size.x / 2, y: size.y / 2 };
    const tOrigin = {
      x: round(center.x),
      y: round(center.y),
    };
    const o = { // Coordinates of top left corner of image for placement
      x: round(x + imageOffsetX - center.x, PRECISION),
      y: round(y + imageOffsetY - center.y, PRECISION),
    };
    const qCoords = transformXY(o.x, o.y, props.mapTransformProps);
    const { quadrant, xySwap } = props.mapTransformProps;
    const rotate = alreadyRotated ? 0 : parsed.imageRotation || 0;
    const imgOrigin =
      !imageRotated && rotated90 ? rotateOrigin(imageOrigin) : imageOrigin;
    const transformProps: TransformProps = {
      quadrant, qCoords, size, rotate, xySwap, noRotation,
      imageOrigin: imgOrigin,
      rotated90: imageRotated && rotated90,
    };
    return {
      height: size.y, width: size.x,
      transform: generateTransform(transformProps),
      transformOrigin: `${tOrigin.x}px ${tOrigin.y}px`,
      comment: JSON.stringify({
        width, height,
        x: { x, offset: imageOffsetX, o: o.x, qx: qCoords.qx },
        y: { y, offset: imageOffsetY, o: o.y, qy: qCoords.qy },
        quadrant, imageOrigin: imgOrigin, xySwap,
        rotated90: { camera: rotated90, image: height > width },
      }).replace(/"/g, ""),
    };
  }
};

export const rotated90degrees = (angle: number | undefined) =>
  (Math.abs(angle || 0) + 45) % 180 > 90;

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
  rotation: number;
  transformOrigin: string;
  alreadyRotated: boolean;
}

const CropClipPaths = (props: CropClipPathsProps) => {
  const {
    imageId, width, height, rotation, transformOrigin, alreadyRotated,
  } = props;
  const center = { x: round(width / 2), y: round(height / 2) };
  const narrow = Math.min(center.x, center.y);
  const crop = cropAmount(rotation, { width, height });
  const rotate = alreadyRotated ? 0 : rotation;
  const rotated90 = !alreadyRotated && rotated90degrees(rotation);
  const transform = `rotate(${rotate - (rotated90 ? 90 : 0)}deg)`;
  return <g id={"crop-clip-paths"}>
    <clipPath id={`circle-${imageId}`}>
      <circle r={narrow} cx={center.x} cy={center.y} />
    </clipPath>
    <clipPath id={`rectangle-${imageId}`}>
      <rect x={crop / 2} y={crop / 2}
        width={round(width - crop)} height={round(height - crop)}
        style={{ transformOrigin, transform }} />
    </clipPath>
  </g>;
};

const cropPathName = (
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
