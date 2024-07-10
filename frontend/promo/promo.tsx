import React from "react";
import { ThreeDGarden } from "../three_d_garden";
import {
  Config, INITIAL, modifyConfigsFromUrlParams,

} from "../three_d_garden/config";

export const Promo = () => {
  const [config, setConfig] = React.useState<Config>(INITIAL);

  React.useEffect(() => {
    setConfig(modifyConfigsFromUrlParams(config));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty dependency array

  return <ThreeDGarden config={config} />;
};
