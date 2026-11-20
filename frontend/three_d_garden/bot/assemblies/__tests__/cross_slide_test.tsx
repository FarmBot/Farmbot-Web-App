import React from "react";
import { render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import { INITIAL } from "../../../config";
import { ASSETS, LIB_DIR } from "../../../constants";
import { getBotVersion } from "../../bot_versions";
import { CrossSlideAssembly } from "../cross_slide";

describe("<CrossSlideAssembly />", () => {
  it.each(["v1.7", "v1.8", "v1.9"])(
    "keeps the correct vacuum housing mount for %s", kitVersion => {
      const gltf = useGLTF as unknown as jest.Mock;
      gltf.mockClear();
      render(<CrossSlideAssembly
        config={{ ...INITIAL, kitVersion }}
        version={getBotVersion(kitVersion)} />);
      const loads = gltf.mock.calls.filter(([asset]) =>
        asset == ASSETS.models.vacuumPumpCover);
      expect(loads).toHaveLength(kitVersion == "v1.8" ? 1 : 0);
      if (kitVersion == "v1.8") {
        expect(gltf).toHaveBeenCalledWith(ASSETS.models.vacuumPumpCover, LIB_DIR);
      }
    },
  );
});
