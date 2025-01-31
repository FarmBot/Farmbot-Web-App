import { Canvas } from "@react-three/fiber";
import React from "react";
import { Config } from "./config";
import { GardenModel } from "./garden";
import { noop } from "lodash";
import { AddPlantProps } from "./bed";

export interface ThreeDGardenProps {
  config: Config;
  addPlantProps: AddPlantProps;
}

export const ThreeDGarden = (props: ThreeDGardenProps) => {
  return <div className={"three-d-garden"}>
    <div className={"garden-bed-3d-model"}>
      <Canvas shadows={true}>
        <GardenModel
          config={props.config}
          activeFocus={""}
          setActiveFocus={noop}
          addPlantProps={props.addPlantProps} />
      </Canvas>
    </div>
  </div>;
};
