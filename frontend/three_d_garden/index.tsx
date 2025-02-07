import { Canvas } from "@react-three/fiber";
import React from "react";
import { Config } from "./config";
import { GardenModel } from "./garden_model";
import { noop } from "lodash";
import { AddPlantProps } from "./bed";
import { TaggedGenericPointer, TaggedWeedPointer } from "farmbot";

export interface ThreeDGardenProps {
  config: Config;
  addPlantProps: AddPlantProps;
  mapPoints: TaggedGenericPointer[];
  weeds: TaggedWeedPointer[];
}

export const ThreeDGarden = (props: ThreeDGardenProps) => {
  return <div className={"three-d-garden"}>
    <div className={"garden-bed-3d-model"}>
      <Canvas shadows={true}>
        <GardenModel
          config={props.config}
          activeFocus={""}
          setActiveFocus={noop}
          mapPoints={props.mapPoints}
          weeds={props.weeds}
          addPlantProps={props.addPlantProps} />
      </Canvas>
    </div>
  </div>;
};
