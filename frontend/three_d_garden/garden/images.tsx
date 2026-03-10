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
    position={[
      props.bedWallThickness + props.width / 2,
      props.bedWallThickness + props.height / 2,
      props.z,
    ]}
    scale={[1, 1, 1]}>
    {props.children}
  </Plane>;

export interface ImageTextureProps extends BaseProps {
  images?: TaggedImage[];
  addPlantProps?: AddPlantProps;
  sensors: TaggedSensor[];
  sensorReadings: TaggedSensorReading[];
  showMoistureReadings: boolean;
  showMoistureMap: boolean;
}

export const ImageTexture = (props: ImageTextureProps) => {
  const extents = soilSurfaceExtents(props.config);
  const width = extents.x.max - extents.x.min;
  const height = extents.y.max - extents.y.min;
  const { bedXOffset, bedYOffset, bedWallThickness } = props.config;
  const soilTexture = useTexture(ASSETS.textures.soil + "?=soilT");
  const color = getColorFromBrightness(props.config.soilBrightness);
  const { addPlantProps, images } = props;
  const designer = addPlantProps?.designer;
  const getConfigValue = addPlantProps?.getConfigValue;
  const visible = !!addPlantProps?.getConfigValue(BooleanSetting.show_images);
  const filteredImages = filterImages({
    visible,
    designer,
    images,
    getConfigValue,
    calibrationZ: "" + props.config.imgCalZ,
  });
  const imageArray = filteredImages.filter(img => !img.highlighted);
  const lastImageArray = filteredImages.filter(img => img.highlighted);
  const highlightActive = lastImageArray[0]?.highlighted;
  const commonProps = { width, height, bedWallThickness };
  return <RenderTexture attach={"map"} width={width} height={height}>
    <OrthographicCamera makeDefault near={10} far={10000}
      left={extents.x.min}
      right={extents.x.max}
      top={extents.y.min}
      bottom={extents.y.max}
      position={[bedXOffset, bedYOffset, 4000]}
      rotation={[0, 0, 0]}
      zoom={1}
      scale={[1, 1, 1]}
      up={[0, 0, 1]} />
    <PlaneWrapper {...commonProps} z={0}>
      <MeshBasicMaterial side={DoubleSide} color={color} map={soilTexture} />
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

interface ImagesProps extends BaseProps {
  images: TaggedImagePlus[];
}

const Images = (props: ImagesProps) => {
  return <>
    {props.images.map(image => {
      const { x, y } = image.body.meta;
      if (isNumber(x) && isNumber(y)) {
        return <React.Suspense>
          <ImageWrapper
            image={image}
            x={x}
            y={y}
            z={props.z}
            xOffset={props.xOffset}
            yOffset={props.yOffset}
            config={props.config} />
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

const ImageWrapper = (props: ImageWrapperProps) => {
  const { config } = props;
  const rawUrl = props.image.body.attachment_url;
  const url = (forceOnline() && rawUrl.endsWith("/soil.png"))
    ? "/soil.png"
    : rawUrl;
  const texture = useTexture(url);
  const i = (texture.source?.data ?? texture.image) as HTMLImageElement | undefined;
  if (!i) { return; }
  const aspect = i.width / i.height;
  const height = i.height * config.imgScale;
  const width = height * aspect;
  if (!props.image.highlighted &&
    !imageSizeCheck({ width: i.width, height: i.height },
      { x: "" + config.imgCenterX, y: "" + config.imgCenterY })) { return; }
  const scale: [number, number, number] = [width, height, 1000];

  const alreadyRotated = isRotated(props.image.body.meta.name);
  const initialRotation = alreadyRotated ? 0 : config.imgRotation;
  const rotation = (initialRotation + extraRotation(config)) * Math.PI / 180;

  return <Decal
    name={"image"}
    map={texture}
    position={[
      props.x + config.imgOffsetX + props.xOffset,
      props.y + config.imgOffsetY + props.yOffset,
      props.z,
    ]}
    debug={config.lightsDebug}
    material-side={DoubleSide}
    depthTest={true}
    rotation={[0, 0, rotation]}
    scale={scale} />;
};

export const extraRotation = (config: Config) => {
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
