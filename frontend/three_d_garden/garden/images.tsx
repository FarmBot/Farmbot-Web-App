import React from "react";
import { TaggedImage, TaggedSensor, TaggedSensorReading } from "farmbot";
import { Config, SurfaceDebugOption } from "../config";
import { isNumber } from "lodash";
import {
  Decal, OrthographicCamera, Plane, RenderTexture, useTexture,
} from "@react-three/drei";
import {
  DataTexture, DoubleSide, Plane as ThreePlane, RGBAFormat, Texture,
  UnsignedByteType, Vector3,
} from "three";
import { ASSETS } from "../constants";
import { MeshBasicMaterial } from "../components";
import { soilSurfaceExtents } from "../triangles";
import { getColorFromBrightness, zZero } from "../helpers";
import {
  filterImages, TaggedImagePlus,
} from "../../farm_designer/map/layers/images/image_layer";
import { AddPlantProps } from "../bed";
import { BooleanSetting, StringSetting } from "../../session_keys";
import {
  cropAmount, imageSizeCheck, isRotated, largeCrop,
} from "../../farm_designer/map/layers/images/map_image";
import { forceOnline } from "../../devices/must_be_online";
import { MoistureSurface } from "./moisture_texture";
import { perfCount, perfMeasure } from "../../performance/perf";
import { ErrorBoundary } from "../../error_boundary";
import { UserEnv } from "../../devices/interfaces";

interface BaseProps {
  config: Config;
  z: number;
  xOffset: number;
  yOffset: number;
}

interface PlaneWrapperProps {
  width: number;
  height: number;
  bedWallThickness: number;
  z: number;
  children: React.ReactNode;
}

const PlaneWrapper = (props: PlaneWrapperProps) =>
  <Plane
    args={[props.width, props.height]}
    onBeforeRender={() => perfCount("soilTextureRenders")}
    position={[
      props.bedWallThickness + props.width / 2,
      props.bedWallThickness + props.height / 2,
      props.z,
    ]}
    scale={[1, 1, 1]}>
    {props.children}
  </Plane>;

export const getMirrorTextureProps =
  (config: Pick<Config, "mirrorX" | "mirrorY">) => ({
    repeat: [
      config.mirrorX ? -1 : 1,
      config.mirrorY ? -1 : 1,
    ] as [number, number],
    offset: [
      config.mirrorX ? 1 : 0,
      config.mirrorY ? 1 : 0,
    ] as [number, number],
  });

export const getImagePosition = (
  config: Pick<Config,
    "mirrorX" | "mirrorY" | "botSizeX" | "botSizeY" | "imgOffsetX" | "imgOffsetY">,
  x: number,
  y: number,
  xOffset: number,
  yOffset: number,
  z: number,
): [number, number, number] => {
  const baseX = config.mirrorX ? config.botSizeX - x : x;
  const baseY = config.mirrorY ? config.botSizeY - y : y;
  return [
    baseX + config.imgOffsetX + xOffset,
    baseY + config.imgOffsetY + yOffset,
    z,
  ];
};

export interface ImageTextureProps extends BaseProps {
  images?: TaggedImage[];
  addPlantProps?: AddPlantProps;
  sensors: TaggedSensor[];
  sensorReadings: TaggedSensorReading[];
  showMoistureReadings: boolean;
  showMoistureMap: boolean;
  env: UserEnv | undefined;
}

const IMAGE_TEXTURE_CONFIG_FIELDS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWidthOuter",
  "bedWallThickness",
  "bedXOffset",
  "bedYOffset",
  "botSizeX",
  "botSizeY",
  "columnLength",
  "clipImages",
  "cropImages",
  "imgCalZ",
  "imgCenterX",
  "imgCenterY",
  "imgOffsetX",
  "imgOffsetY",
  "imgOrigin",
  "imgRotation",
  "imgScale",
  "interpolationPower",
  "interpolationStepSize",
  "interpolationUseNearest",
  "lightsDebug",
  "mirrorX",
  "mirrorY",
  "showUncroppedCameraView",
  "soilBrightness",
  "surfaceDebug",
  "zGantryOffset",
];

const IMAGE_TEXTURE_SETTING_FIELDS = [
  BooleanSetting.crop_images,
  BooleanSetting.clip_image_layer,
  BooleanSetting.show_images,
  StringSetting.photo_filter_begin,
  StringSetting.photo_filter_end,
] as const;

const imageTextureConfigFieldsEqual = (prev: Config, next: Config) =>
  IMAGE_TEXTURE_CONFIG_FIELDS.every(field => prev[field] === next[field]);

const imageTextureSettingFieldsEqual = (
  prev: ImageTextureProps,
  next: ImageTextureProps,
) =>
  IMAGE_TEXTURE_SETTING_FIELDS.every(field =>
    prev.addPlantProps?.getConfigValue(field)
    === next.addPlantProps?.getConfigValue(field));

const imageTexturePropsEqual = (
  prev: Readonly<ImageTextureProps>,
  next: Readonly<ImageTextureProps>,
) =>
  prev.images === next.images
  && prev.addPlantProps === next.addPlantProps
  && prev.sensors === next.sensors
  && prev.sensorReadings === next.sensorReadings
  && prev.showMoistureReadings === next.showMoistureReadings
  && prev.showMoistureMap === next.showMoistureMap
  && prev.xOffset === next.xOffset
  && prev.yOffset === next.yOffset
  && prev.z === next.z
  && prev.env?.["CAMERA_CALIBRATION_camera_z"]
  === next.env?.["CAMERA_CALIBRATION_camera_z"]
  && imageTextureConfigFieldsEqual(prev.config, next.config)
  && imageTextureSettingFieldsEqual(prev, next);

const getSensorKey = (sensors: TaggedSensor[]) => {
  let key = "";
  sensors.map(sensor => {
    key += `${sensor.uuid},${sensor.body.label},`;
    key += `${sensor.body.mode},${sensor.body.pin}|`;
  });
  return key;
};

const getSensorReadingKey = (readings: TaggedSensorReading[]) => {
  let key = "";
  readings.map(reading => {
    key += `${reading.uuid},${reading.body.x},${reading.body.y},`;
    key += `${reading.body.z},${reading.body.value},`;
    key += `${reading.body.mode},${reading.body.pin},${reading.body.read_at}|`;
  });
  return key;
};

const getPhotoFilterKey = (props: ImageTextureProps) => {
  const designer = props.addPlantProps?.designer;
  const getConfigValue = props.addPlantProps?.getConfigValue;
  return [
    props.images?.map(image => image.uuid).join(","),
    designer?.hiddenImages.join(","),
    designer?.shownImages.join(","),
    designer?.hideUnShownImages,
    designer?.alwaysHighlightImage,
    designer?.showPhotoImages,
    designer?.showCalibrationImages,
    designer?.showDetectionImages,
    designer?.showHeightImages,
    designer?.hoveredMapImage,
    props.env?.["CAMERA_CALIBRATION_camera_z"],
    IMAGE_TEXTURE_SETTING_FIELDS.map(field => getConfigValue?.(field)).join(","),
  ].join(":");
};

export const getImageTextureKey = (props: ImageTextureProps) => {
  const extents = soilSurfaceExtents(props.config);
  const moistureVisible = props.showMoistureMap || props.showMoistureReadings;
  return [
    extents.x.min, extents.x.max,
    extents.y.min, extents.y.max,
    props.config.surfaceDebug,
    props.showMoistureMap,
    props.showMoistureReadings,
    moistureVisible && getSensorKey(props.sensors),
    moistureVisible && getSensorReadingKey(props.sensorReadings),
    getPhotoFilterKey(props),
  ].join(":");
};

export const splitFilteredImages = (filteredImages: TaggedImagePlus[]) => {
  const imageArray: TaggedImagePlus[] = [];
  const lastImageArray: TaggedImagePlus[] = [];
  for (const image of filteredImages) {
    if (image.highlighted) {
      lastImageArray.push(image);
    } else {
      imageArray.push(image);
    }
  }
  return { imageArray, lastImageArray };
};

const ImageTextureBase = (props: ImageTextureProps) => {
  const extents = soilSurfaceExtents(props.config);
  const width = extents.x.max - extents.x.min;
  const height = extents.y.max - extents.y.min;
  const textureSize = 1024;
  const textureWidth = width >= height
    ? textureSize
    : Math.max(1, Math.round(textureSize * width / height));
  const textureHeight = height >= width
    ? textureSize
    : Math.max(1, Math.round(textureSize * height / width));
  const textureKey = perfMeasure("imageTextureSetupMs", () =>
    getImageTextureKey(props));
  const { bedXOffset, bedYOffset, bedWallThickness } = props.config;
  const soilTexture = useTexture(ASSETS.textures.soil + "?=soilT");
  const color = getColorFromBrightness(props.config.soilBrightness);
  const { addPlantProps, images } = props;
  const designer = addPlantProps?.designer;
  const getConfigValue = addPlantProps?.getConfigValue;
  const visible = !!addPlantProps?.getConfigValue(BooleanSetting.show_images);
  const { imageArray, lastImageArray } =
    perfMeasure("imageTextureSetupMs", () => {
      const filteredImages = filterImages({
        visible,
        designer,
        images,
        getConfigValue,
        calibrationZ: props.env?.["CAMERA_CALIBRATION_camera_z"],
      });
      return splitFilteredImages(filteredImages);
    });
  const highlightActive = lastImageArray[0]?.highlighted;
  const commonProps = { width, height, bedWallThickness };
  const mirrorTextureProps = getMirrorTextureProps(props.config);
  return <RenderTexture
    key={textureKey}
    attach={"map"}
    frames={1}
    width={textureWidth}
    height={textureHeight}
    repeat={mirrorTextureProps.repeat}
    offset={mirrorTextureProps.offset}>
    <OrthographicCamera makeDefault near={10} far={10000}
      left={extents.x.min}
      right={extents.x.max}
      top={extents.y.min}
      bottom={extents.y.max}
      position={[bedXOffset, bedYOffset, 4000]}
      rotation={[0, 0, 0]}
      zoom={1}
      up={[0, 0, 1]} />
    <PlaneWrapper {...commonProps} z={0}>
      <MeshBasicMaterial side={DoubleSide} color={color}
        map={props.config.surfaceDebug == SurfaceDebugOption.blank
          ? undefined
          : soilTexture} />
      <Images {...props} images={imageArray} />
    </PlaneWrapper>
    {highlightActive &&
      <PlaneWrapper {...commonProps} z={1}>
        <MeshBasicMaterial side={DoubleSide} color={"orange"} />
      </PlaneWrapper>}
    {highlightActive &&
      <PlaneWrapper {...commonProps} z={2}>
        <MeshBasicMaterial opacity={0} transparent={true} />
        <Images {...props} images={lastImageArray} />
      </PlaneWrapper>}
    <MoistureSurface
      config={props.config}
      color={"black"}
      radius={10}
      sensors={props.sensors}
      sensorReadings={props.sensorReadings}
      showMoistureReadings={props.showMoistureReadings}
      showMoistureMap={props.showMoistureMap}
      position={[
        props.config.bedXOffset,
        props.config.bedYOffset,
        zZero(props.config),
      ]}
      readingZOverride={2000} />
  </RenderTexture>;
};

export const ImageTexture = React.memo(ImageTextureBase, imageTexturePropsEqual);

interface ImagesProps extends BaseProps {
  images: TaggedImagePlus[];
}

const Images = (props: ImagesProps) => {
  return <>
    {props.images.map(image => {
      const { x, y } = image.body.meta;
      if (isNumber(x) && isNumber(y)) {
        return <React.Suspense key={image.uuid}>
          <ErrorBoundary fallback={<></>}>
            <ImageWrapper
              image={image}
              x={x}
              y={y}
              z={props.z}
              xOffset={props.xOffset}
              yOffset={props.yOffset}
              config={props.config} />
          </ErrorBoundary>
        </React.Suspense>;
      }
    })}
  </>;
};

interface ImageWrapperProps {
  image: TaggedImagePlus;
  x: number;
  y: number;
  z: number;
  config: Config;
  xOffset: number;
  yOffset: number;
}

const IMAGE_WRAPPER_CONFIG_FIELDS: (keyof Config)[] = [
  "botSizeX",
  "botSizeY",
  "clipImages",
  "cropImages",
  "imgCenterX",
  "imgCenterY",
  "imgOffsetX",
  "imgOffsetY",
  "imgOrigin",
  "imgRotation",
  "imgScale",
  "lightsDebug",
  "mirrorX",
  "mirrorY",
];

const imageWrapperConfigFieldsEqual = (prev: Config, next: Config) =>
  IMAGE_WRAPPER_CONFIG_FIELDS.every(field => prev[field] === next[field]);

const imageWrapperImagesEqual = (
  prev: TaggedImagePlus,
  next: TaggedImagePlus,
) =>
  prev.uuid === next.uuid
  && prev.highlighted === next.highlighted
  && prev.body.attachment_url === next.body.attachment_url
  && prev.body.meta.name === next.body.meta.name;

const usesDemoSoilTexture = (image: TaggedImagePlus) =>
  image.body.attachment_url.endsWith("/soil.png");

const imageWrapperPropsEqual = (
  prev: Readonly<ImageWrapperProps>,
  next: Readonly<ImageWrapperProps>,
) =>
  !usesDemoSoilTexture(prev.image)
  && !usesDemoSoilTexture(next.image)
  && prev.x === next.x
  && prev.y === next.y
  && prev.z === next.z
  && prev.xOffset === next.xOffset
  && prev.yOffset === next.yOffset
  && imageWrapperImagesEqual(prev.image, next.image)
  && imageWrapperConfigFieldsEqual(prev.config, next.config);

type ImageClippingConfig = Pick<Config,
  "botSizeX" | "botSizeY" | "clipImages">;

export const getImageClippingPlanes = (
  config: ImageClippingConfig,
): ThreePlane[] | undefined =>
  config.clipImages
    ? [
      new ThreePlane(new Vector3(1, 0, 0), 0),
      new ThreePlane(new Vector3(-1, 0, 0), config.botSizeX),
      new ThreePlane(new Vector3(0, 1, 0), 0),
      new ThreePlane(new Vector3(0, -1, 0), config.botSizeY),
    ]
    : undefined;

const CIRCLE_MASK_SIZE = 64;

export const createCircleCropMask = () => {
  const data = new Uint8Array(CIRCLE_MASK_SIZE * CIRCLE_MASK_SIZE * 4);
  const center = (CIRCLE_MASK_SIZE - 1) / 2;
  const radius = CIRCLE_MASK_SIZE / 2;
  for (let y = 0; y < CIRCLE_MASK_SIZE; y++) {
    for (let x = 0; x < CIRCLE_MASK_SIZE; x++) {
      const distance = Math.hypot(x - center, y - center);
      const value = Math.round(255 * Math.max(
        0,
        Math.min(1, radius - distance),
      ));
      const index = (y * CIRCLE_MASK_SIZE + x) * 4;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = value;
    }
  }
  const texture = new DataTexture(
    data,
    CIRCLE_MASK_SIZE,
    CIRCLE_MASK_SIZE,
    RGBAFormat,
    UnsignedByteType,
  );
  texture.needsUpdate = true;
  return texture;
};

const CIRCLE_CROP_MASK = createCircleCropMask();

const ImageWrapperBase = (props: ImageWrapperProps) => {
  const { config } = props;
  const rawUrl = props.image.body.attachment_url;
  const url = (forceOnline() && rawUrl.endsWith("/soil.png"))
    ? "/soil.png"
    : rawUrl;
  const texture = useTexture(url);
  const i = (texture.source?.data ?? texture.image) as HTMLImageElement | undefined;
  const crop = React.useMemo(() => i
    ? get3DImageCrop({
      enabled: config.cropImages,
      imageRotation: config.imgRotation,
      imageWidth: i.width,
      imageHeight: i.height,
      imageScale: config.imgScale,
    })
    : undefined, [
    config.cropImages,
    config.imgRotation,
    config.imgScale,
    i,
  ]);
  const map = React.useMemo(() => crop
    ? getCroppedTexture(texture, crop)
    : texture, [crop, texture]);
  const { botSizeX, botSizeY, clipImages } = config;
  const clippingPlanes = React.useMemo(
    () => getImageClippingPlanes({ botSizeX, botSizeY, clipImages }),
    [botSizeX, botSizeY, clipImages],
  );
  React.useEffect(() => () => {
    if (map != texture) { map.dispose(); }
  }, [map, texture]);
  if (!i) { return; }
  return perfMeasure("imageWrapperSetupMs", () => {
    const aspect = i.width / i.height;
    const height = i.height * config.imgScale;
    const width = height * aspect;
    if (!props.image.highlighted &&
      !imageSizeCheck({ width: i.width, height: i.height },
        { x: "" + config.imgCenterX, y: "" + config.imgCenterY })) { return; }

    const alreadyRotated = isRotated(props.image.body.meta.name);
    const initialRotation = alreadyRotated ? 0 : config.imgRotation;
    const rotation = (initialRotation + extraRotation(config)) * Math.PI / 180;

    return <Decal
      name={"image"}
      map={map}
      position={getImagePosition(
        config, props.x, props.y, props.xOffset, props.yOffset, props.z)}
      debug={config.lightsDebug}
      material-side={DoubleSide}
      material-alphaMap={crop?.circle ? CIRCLE_CROP_MASK : undefined}
      material-transparent={true}
      material-clippingPlanes={clippingPlanes}
      depthTest={true}
      rotation={[0, 0, rotation]}
      scale={[crop?.width || width, crop?.height || height, 1000]} />;
  });
};

const ImageWrapper = React.memo(ImageWrapperBase, imageWrapperPropsEqual);

export interface ImageCrop {
  circle: boolean;
  width: number;
  height: number;
  repeat: [number, number];
  offset: [number, number];
}

interface Get3DImageCropProps {
  enabled: boolean;
  imageRotation: number;
  imageWidth: number;
  imageHeight: number;
  imageScale: number;
}

export const get3DImageCrop = (
  props: Get3DImageCropProps,
): ImageCrop | undefined => {
  if (!props.enabled || !props.imageRotation) { return; }
  const size = { width: props.imageWidth, height: props.imageHeight };
  const crop = cropAmount(props.imageRotation, size);
  const circleCrop = largeCrop(props.imageRotation);
  const croppedWidth = circleCrop
    ? Math.min(size.width, size.height)
    : Math.max(1, size.width - crop);
  const croppedHeight = circleCrop
    ? Math.min(size.width, size.height)
    : Math.max(1, size.height - crop);
  return {
    circle: circleCrop,
    width: croppedWidth * props.imageScale,
    height: croppedHeight * props.imageScale,
    repeat: [croppedWidth / size.width, croppedHeight / size.height],
    offset: [
      (size.width - croppedWidth) / size.width / 2,
      (size.height - croppedHeight) / size.height / 2,
    ],
  };
};

export const getCroppedTexture = (texture: Texture, crop: ImageCrop) => {
  const croppedTexture = texture.clone();
  croppedTexture.repeat.set(...crop.repeat);
  croppedTexture.offset.set(...crop.offset);
  croppedTexture.needsUpdate = true;
  return croppedTexture;
};

export const extraRotation = (config: Pick<Config, "imgOrigin">) => {
  switch (config.imgOrigin) {
    case "BOTTOM_LEFT":
      return 0;
    case "TOP_RIGHT":
      return -180;
    case "BOTTOM_RIGHT":
      return -90;
    case "TOP_LEFT":
    default:
      return 90;
  }
};
