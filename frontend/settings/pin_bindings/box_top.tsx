import React from "react";
import { ElectronicsBoxModel } from "./model";
import { BoxTopButtons } from "./box_top_gpio_diagram";
import { BoxTopProps } from "./interfaces";

export const BoxTop = (props: BoxTopProps) =>
  <div className={"electronics-box-top"}>
    {props.threeDimensions
      ? <ElectronicsBoxModel {...props} />
      : <BoxTopButtons {...props} />}
  </div>;
