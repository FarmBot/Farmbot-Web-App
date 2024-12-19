import { Canvas } from "@react-three/fiber";
import React from "react";
import { Config } from "./config";
import { GardenModel, ThreeDGardenPlant } from "./garden";
import { noop } from "lodash";

export interface ThreeDGardenProps {
  config: Config;
  plants: ThreeDGardenPlant[];
}

export const ThreeDGarden = (props: ThreeDGardenProps) => {
  return <div className={"three-d-garden"}>
    <div className={"garden-bed-3d-model"}>
      <Canvas shadows={true}>
        <GardenModel config={props.config}
          plants={props.plants}
          activeFocus={""} setActiveFocus={noop} />
      </Canvas>
    </div>
  </div>;
};
