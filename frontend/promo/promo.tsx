import React from "react";
import {
  Config, INITIAL, modifyConfigsFromUrlParams,
} from "../three_d_garden/config";
import { GardenModel } from "../three_d_garden/garden";
import { Canvas } from "@react-three/fiber";
import {
  PrivateOverlay, PublicOverlay, ToolTip,
} from "../three_d_garden/config_overlays";
import { ASSETS } from "../three_d_garden/constants";
import { getFocusFromUrlParams } from "../three_d_garden/zoom_beacons_constants";

export const Promo = () => {
  const [config, setConfig] = React.useState<Config>(INITIAL);
  const [toolTip, setToolTip] = React.useState<ToolTip>({ timeoutId: 0, text: "" });
  const [activeFocus, setActiveFocus] = React.useState("");
  const common = {
    config, setConfig,
    toolTip, setToolTip,
    activeFocus, setActiveFocus,
  };

  React.useEffect(() => {
    setConfig(modifyConfigsFromUrlParams(config));
    setActiveFocus(getFocusFromUrlParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty dependency array

  return <div className={"three-d-garden"}>
    <div className={"garden-bed-3d-model"}>
      <Canvas shadows={true}>
        <GardenModel {...common} />
      </Canvas>
      <PublicOverlay {...common} />
      {!config.config && <img className={"gear"} src={ASSETS.other.gear}
        onClick={() => setConfig({ ...config, config: true })} />}
      {config.config &&
        <PrivateOverlay {...common} />}
      <span className={"tool-tip"} hidden={!toolTip.text}>
        {toolTip.text}
      </span>
    </div>
  </div>;
};
