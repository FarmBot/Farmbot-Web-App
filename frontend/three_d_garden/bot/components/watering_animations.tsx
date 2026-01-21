import React from "react";
import { range } from "lodash";
import { Group } from "../../components";
import { ASSETS } from "../../constants";
import { Cloud, Clouds } from "@react-three/drei";
import { WaterStream } from "./water_stream";
import { easyCubicBezierCurve3, threeSpace, zDir, zZero } from "../../helpers";
import { Config } from "../../config";
import { utmHeight } from "../bot";

export interface WateringAnimationsProps {
  waterFlow: boolean;
  config: Config;
  getZ(x: number, y: number): number;
}

export const WateringAnimations = React.memo((props: WateringAnimationsProps) => {
  const { waterFlow, getZ, config } = props;
  const { x, y, z, bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset } = config;
  const zDirection = React.useMemo(() => zDir(config), [config]);
  const zZeroPosition = React.useMemo(() => zZero(config), [config]);
  const utmZ = React.useMemo(
    () => -zDirection * z + utmHeight / 2 - 15,
    [z, zDirection],
  );
  const soilZ = React.useMemo(() => getZ(x, y), [getZ, x, y]);
  const nozzleToSoil = React.useMemo(
    () => soilZ - utmZ,
    [soilZ, utmZ],
  );
  const groupPosition = React.useMemo<[number, number, number]>(() => ([
    threeSpace(x, bedLengthOuter) + bedXOffset,
    threeSpace(y, bedWidthOuter) + bedYOffset,
    zZeroPosition,
  ]), [
    bedLengthOuter,
    bedWidthOuter,
    bedXOffset,
    bedYOffset,
    x,
    y,
    zZeroPosition,
  ]);
  const streamPosition = React.useMemo<[number, number, number]>(
    () => [0, 0, utmZ], [utmZ]);
  const streamConfigs = React.useMemo(() => range(16).map(i => {
    const angle = (i * Math.PI * 2) / 16;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    return {
      key: i,
      args: [
        easyCubicBezierCurve3(
          [12.5 * sin, 12.5 * cos, 0],
          [10 * sin, 0, -10],
          [0, 0, 10],
          [25 * sin, 25 * cos, nozzleToSoil],
        ),
        8,
        1.5,
        6,
      ] as [ReturnType<typeof easyCubicBezierCurve3>, number, number, number],
    };
  }), [nozzleToSoil]);
  const mistCloudPosition = React.useMemo<[number, number, number]>(
    () => [0, 0, utmZ + nozzleToSoil / 2 - 40],
    [nozzleToSoil, utmZ],
  );
  const mistCloudBounds = React.useMemo<[number, number, number]>(
    () => [15, 15, nozzleToSoil / 2],
    [nozzleToSoil],
  );
  const spotMistPosition = React.useMemo<[number, number, number]>(
    () => [0, 0, soilZ],
    [soilZ],
  );
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);
  return <Group name={"watering-animations"}
    visible={visible}
    position={groupPosition}>
    {streamConfigs.map(stream => <WaterStream key={stream.key}
      name={`water-stream-${stream.key}`}
      waterFlow={waterFlow}
      position={streamPosition}
      args={stream.args} />)}
    <Clouds name={"waterfall-mist"}
      texture={ASSETS.textures.cloud}>
      <Cloud name={"waterfall-mist-cloud"}
        position={mistCloudPosition}
        seed={0}
        bounds={mistCloudBounds}
        segments={30}
        volume={15}
        smallestVolume={0.1}
        concentrate={"inside"}
        color={"rgb(80, 210, 255)"}
        growth={40}
        speed={3}
        opacity={0.4}
        fade={5} />
    </Clouds>
    <Clouds name={"water-spot-mist"}
      texture={ASSETS.textures.cloud}>
      <Cloud name={"waterfall-mist-cloud"}
        position={spotMistPosition}
        seed={0}
        bounds={[30, 30, 30]}
        segments={25}
        volume={100}
        smallestVolume={0.1}
        concentrate={"inside"}
        color={"rgb(80, 210, 255)"}
        growth={50}
        speed={3}
        opacity={0.5}
        fade={5} />
    </Clouds>
  </Group>;
});
