import React from "react";
import { ElectronicsBoxModel } from "./model";
import { BoxTopButtons } from "./box_top_gpio_diagram";
import { BoxTopProps } from "./interfaces";
import { ThreeDGuard } from
  "../../three_d_garden/three_d_required_overlay";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { BooleanSetting } from "../../session_keys";

export const BoxTop = (props: BoxTopProps) =>
  <div className={"electronics-box-top"}>
    {props.threeDimensions
      ? <ThreeDGuard onSwitchTo2D={() => props.dispatch(
        setWebAppConfigValue(
          BooleanSetting.enable_3d_electronics_box_top, false))}>
        <ElectronicsBoxModel {...props} />
      </ThreeDGuard>
      : <BoxTopButtons {...props} />}
  </div>;
