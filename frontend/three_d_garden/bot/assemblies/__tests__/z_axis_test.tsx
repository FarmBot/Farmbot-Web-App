import React from "react";
import { render } from "@testing-library/react";
import { Object3D } from "three";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { getBotVersion } from "../../bot_versions";
import { ZAxisAssembly, ZAxisAssemblyProps } from "../z_axis";

describe("<ZAxisAssembly />", () => {
  const fakeProps = (): ZAxisAssemblyProps => ({
    config: { ...INITIAL },
    configPosition: { ...INITIAL_POSITION },
    version: getBotVersion(INITIAL.kitVersion),
    zAxisShape: undefined,
    trailReady: false,
    trailTarget: { current: new Object3D() },
  });

  it.each(["v1.3", "v1.7", "v1.8", "v1.9"])(
    "renders a gray UTM for %s and charcoal for v1.2", kitVersion => {
      const p = fakeProps();
      p.config.kitVersion = kitVersion;
      p.version = getBotVersion(kitVersion);
      const { container, rerender } = render(<ZAxisAssembly {...p} />);
      const selector = "[name='UTM'] > mesh > [color]";
      expect(container.querySelector(selector)).toHaveAttribute("color", "#ccc");
      rerender(<ZAxisAssembly {...p}
        config={{ ...p.config, kitVersion: "v1.2" }}
        version={getBotVersion("v1.2")} />);
      expect(container.querySelector(selector)).toHaveAttribute("color", "#333");
      rerender(<ZAxisAssembly {...p} />);
      expect(container.querySelector(selector)).toHaveAttribute("color", "#ccc");
    },
  );
});
