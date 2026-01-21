import React from "react";
import { TaggedImage, TaggedSensor, TaggedSensorReading } from "farmbot";
import { Config } from "../config";
import { isNumber } from "lodash";
import {
  Decal, OrthographicCamera, Plane, RenderTexture, useTexture,
} from "@react-three/drei";
import { DoubleSide } from "three";
import { ASSETS } from "../constants";
import { MeshBasicMaterial } from "../components";
import { soilSurfaceExtents } from "../triangles";
import { getColorFromBrightness, zZero } from "../helpers";
import {
  filterImages, TaggedImagePlus,
} from "../../farm_designer/map/layers/images/image_layer";
import { AddPlantProps } from "../bed";
import { BooleanSetting } from "../../session_keys";
import {
  imageSizeCheck, isRotated,
} from "../../farm_designer/map/layers/images/map_image";
import { forceOnline } from "../../devices/must_be_online";
import { MoistureSurface } from "./moisture_texture";

interface BaseProps {
  config: Config;
  z: number;
  xOffset: number;
  yOffset: number;
}

export interface ImageTextureProps extends BaseProps {
  images?: TaggedImage[];
  addPlantProps?: AddPlantProps;
  sensors: TaggedSensor[];
  sensorReadings: TaggedSensorReading[];
  showMoistureReadings: boolean;
  showMoistureMap: boolean;
}

const splitHighlightedImages = (images: TaggedImagePlus[]) => {
  const imageArray: TaggedImagePlus[] = [];
  const lastImageArray: TaggedImagePlus[] = [];
  for (const image of images) {
    if (image.highlighted) {
      lastImageArray.push(image);
    } else {
      imageArray.push(image);
    }
  }
  return {
    imageArray,
    lastImageArray,
    highlightActive: lastImageArray.length > 0,
  };
};

export const ImageTexture = React.memo((props: ImageTextureProps) => {
  const {
    bedWallThickness,
    bedXOffset,
    bedYOffset,
    bedWidthOuter,
    bedLengthOuter,
    soilBrightness,
    imgCalZ,
  } = props.config;
  const extentsConfig = React.useMemo(() => ({
    bedWallThickness,
    bedXOffset,
    bedYOffset,
    bedWidthOuter,
    bedLengthOuter,
  } as Config), [
    bedWallThickness,
    bedXOffset,
    bedYOffset,
    bedWidthOuter,
    bedLengthOuter,
  ]);
  const extents = React.useMemo(
    () => soilSurfaceExtents(extentsConfig),
    [extentsConfig],
  );
  const { width, height } = React.useMemo(() => ({
    width: extents.x.max - extents.x.min,
    height: extents.y.max - extents.y.min,
  }), [
    extents.x.max,
    extents.x.min,
    extents.y.max,
    extents.y.min,
  ]);
  const planePosition = React.useMemo(() => ([
    bedWallThickness + width / 2,
    bedWallThickness + height / 2,
  ] as [number, number]), [
    bedWallThickness,
    width,
    height,
  ]);
  const soilTexture = useTexture(ASSETS.textures.soil + "?=soilT");
  const color = React.useMemo(
    () => getColorFromBrightness(soilBrightness),
    [soilBrightness],
  );
  const { addPlantProps, images } = props;
  const designer = addPlantProps?.designer;
  const getConfigValue = addPlantProps?.getConfigValue;
  const visible = React.useMemo(
    () => !!addPlantProps?.getConfigValue(BooleanSetting.show_images),
    [addPlantProps],
  );
  const filteredImages = React.useMemo(() => filterImages({
    visible,
    designer,
    images,
    getConfigValue,
    calibrationZ: "" + imgCalZ,
  }), [
    designer,
    getConfigValue,
    images,
    imgCalZ,
    visible,
  ]);
  const imagesKey = React.useMemo(() => filteredImages
    .map(image =>
      `${image.uuid}:${image.body.updated_at || ""}:${image.body.attachment_url}`)
    .join("|"), [filteredImages]);
  const { imageArray, lastImageArray, highlightActive } = React.useMemo(
    () => splitHighlightedImages(filteredImages),
    [filteredImages],
  );
  const sensorsKey = React.useMemo(() => props.sensors
    .map(sensor =>
      `${sensor.uuid}:${sensor.body.pin}:${sensor.body.label || ""}`)
    .join("|"), [props.sensors]);
  const readingsKey = React.useMemo(() => props.sensorReadings
    .map(reading =>
      `${reading.uuid}:${reading.body.x}:${reading.body.y}:` +
      `${reading.body.z}:${reading.body.value}`)
    .join("|"), [props.sensorReadings]);
  const imageTransformKey = React.useMemo(() => [
    props.config.imgScale,
    props.config.imgRotation,
    props.config.imgOffsetX,
    props.config.imgOffsetY,
    props.config.imgOrigin,
    props.config.imgCenterX,
    props.config.imgCenterY,
    props.config.lightsDebug ? 1 : 0,
  ].join(":"), [
    props.config.imgScale,
    props.config.imgRotation,
    props.config.imgOffsetX,
    props.config.imgOffsetY,
    props.config.imgOrigin,
    props.config.imgCenterX,
    props.config.imgCenterY,
    props.config.lightsDebug,
  ]);
  const renderKey = React.useMemo(() => [
    imagesKey,
    sensorsKey,
    readingsKey,
    imageTransformKey,
    props.showMoistureReadings ? 1 : 0,
    props.showMoistureMap ? 1 : 0,
    props.z,
    props.xOffset,
    props.yOffset,
    props.config.bedWallThickness,
    props.config.bedXOffset,
    props.config.bedYOffset,
    props.config.bedWidthOuter,
    props.config.bedLengthOuter,
    props.config.soilBrightness,
    props.config.imgCalZ,
  ].join("|"), [
    imagesKey,
    sensorsKey,
    readingsKey,
    imageTransformKey,
    props.showMoistureReadings,
    props.showMoistureMap,
    props.z,
    props.xOffset,
    props.yOffset,
    props.config.bedWallThickness,
    props.config.bedXOffset,
    props.config.bedYOffset,
    props.config.bedWidthOuter,
    props.config.bedLengthOuter,
    props.config.soilBrightness,
    props.config.imgCalZ,
  ]);
  const cameraPosition = React.useMemo<[number, number, number]>(
    () => [bedXOffset, bedYOffset, 4000],
    [bedXOffset, bedYOffset],
  );
  const cameraUp = React.useMemo<[number, number, number]>(() => [0, 0, 1], []);
  const moisturePosition = React.useMemo<[number, number, number]>(() => ([
    props.config.bedXOffset,
    props.config.bedYOffset,
    zZero(props.config),
  ]), [
    props.config.bedXOffset,
    props.config.bedYOffset,
    props.config.columnLength,
    props.config.zGantryOffset,
  ]);
  const PlaneWrapper = React.useCallback(
    ({ children, z }: { z: number, children: React.ReactNode }) =>
      <Plane
        args={[width, height]}
        position={[planePosition[0], planePosition[1], z]}
        scale={[1, 1, 1]}>
        {children}
      </Plane>,
    [height, planePosition, width],
  );
  return <RenderTexture
    key={renderKey}
    frames={1}
    attach={"map"}
    width={width}
    height={height}>
    <OrthographicCamera makeDefault near={10} far={10000}
      left={extents.x.min}
      right={extents.x.max}
      top={extents.y.min}
      bottom={extents.y.max}
      position={cameraPosition}
      rotation={[0, 0, 0]}
      zoom={1}
      scale={[1, 1, 1]}
      up={cameraUp} />
    <PlaneWrapper z={0}>
      <MeshBasicMaterial side={DoubleSide} color={color} map={soilTexture} />
      <Images {...props} images={imageArray} />
    </PlaneWrapper>
    {highlightActive &&
      <PlaneWrapper z={1}>
        <MeshBasicMaterial side={DoubleSide} color={"orange"} />
      </PlaneWrapper>}
    {highlightActive &&
      <PlaneWrapper z={2}>
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
      position={moisturePosition}
      readingZOverride={2000} />
  </RenderTexture>;
});

interface ImagesProps extends BaseProps {
  images: TaggedImagePlus[];
}

const Images = React.memo((props: ImagesProps) => {
  const {
    imgScale,
    imgRotation,
    imgOffsetX,
    imgOffsetY,
    imgOrigin,
    imgCenterX,
    imgCenterY,
    lightsDebug,
  } = props.config;
  const imageConfig = React.useMemo(() => ({
    imgScale,
    imgRotation,
    imgOffsetX,
    imgOffsetY,
    imgOrigin,
    imgCenterX,
    imgCenterY,
    lightsDebug,
  } as Config), [
    imgScale,
    imgRotation,
    imgOffsetX,
    imgOffsetY,
    imgOrigin,
    imgCenterX,
    imgCenterY,
    lightsDebug,
  ]);
  const imageElements = React.useMemo(() =>
    props.images.map(image => {
      const { x, y } = image.body.meta;
      if (isNumber(x) && isNumber(y)) {
        return <React.Suspense key={image.uuid}>
          <ImageWrapper
            image={image}
            x={x}
            y={y}
            z={props.z}
            xOffset={props.xOffset}
            yOffset={props.yOffset}
            config={imageConfig} />
        </React.Suspense>;
      }
    }),
  [
    imageConfig,
    props.images,
    props.xOffset,
    props.yOffset,
    props.z,
  ]);
  return <>{imageElements}</>;
});

interface ImageWrapperProps {
  image: TaggedImagePlus;
  x: number;
  y: number;
  z: number;
  config: Config;
  xOffset: number;
  yOffset: number;
}

const ImageWrapper = React.memo((props: ImageWrapperProps) => {
  const { config } = props;
  const rawUrl = props.image.body.attachment_url;
  const online = forceOnline();
  const url = React.useMemo(() =>
    (online && rawUrl.endsWith("/soil.png"))
      ? "/soil.png"
      : rawUrl,
  [online, rawUrl]);
  const texture = useTexture(url);
  const i = (texture.source?.data ?? texture.image) as HTMLImageElement | undefined;
  if (!i) { return; }
  const aspect = i.width / i.height;
  const height = i.height * config.imgScale;
  const width = height * aspect;
  if (!props.image.highlighted &&
    !imageSizeCheck({ width: i.width, height: i.height },
      { x: "" + config.imgCenterX, y: "" + config.imgCenterY })) { return; }
  const scale = React.useMemo<[number, number, number]>(
    () => [width, height, 1000], [height, width]);

  const alreadyRotated = isRotated(props.image.body.meta.name);
  const rotation = React.useMemo(() => {
    const initialRotation = alreadyRotated ? 0 : config.imgRotation;
    return (initialRotation + extraRotation(config)) * Math.PI / 180;
  }, [alreadyRotated, config]);
  const position = React.useMemo<[number, number, number]>(() => ([
    props.x + config.imgOffsetX + props.xOffset,
    props.y + config.imgOffsetY + props.yOffset,
    props.z,
  ]), [
    config.imgOffsetX,
    config.imgOffsetY,
    props.x,
    props.xOffset,
    props.y,
    props.yOffset,
    props.z,
  ]);

  return <Decal
    name={"image"}
    map={texture}
    position={position}
    debug={config.lightsDebug}
    material-side={DoubleSide}
    depthTest={true}
    rotation={[0, 0, rotation]}
    scale={scale} />;
});

export const extraRotation = (config: Config) => {
  switch (config.imgOrigin) {
    case "BOTTOM_LEFT":
      return 90;
    case "TOP_RIGHT":
      return -90;
    case "BOTTOM_RIGHT":
      return 180;
    case "TOP_LEFT":
    default:
      return 0;
  }
};
