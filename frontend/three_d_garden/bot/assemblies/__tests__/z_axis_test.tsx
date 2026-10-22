import React from "react";
import { render } from "@testing-library/react";
import { MeshStandardMaterial, Object3D } from "three";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { getBotVersion } from "../../bot_versions";
import { ZAxisAssembly, ZAxisAssemblyProps } from "../z_axis";
import * as hardware from "../../tool_hardware";
import * as components from "../../../components";

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
    "uses gold-barb materials for %s and v1.2", kitVersion => {
      const p = fakeProps();
      p.config.kitVersion = kitVersion;
      p.version = getBotVersion(kitVersion);
      const material = new MeshStandardMaterial();
      const hook = jest.spyOn(hardware, "useToolMaterials")
        .mockReturnValue({ material, hardwareMaterial: material });
      const Mesh = components.Mesh;
      const mesh = jest.spyOn(components, "Mesh")
        .mockImplementation(props => <Mesh {...props} />);
      try {
        const { rerender } = render(<ZAxisAssembly {...p} />);
        expect(hook).toHaveBeenLastCalledWith(
          expect.anything(), kitVersion, "utm");
        expect(mesh.mock.calls.some(([props]) => props.material == material))
          .toEqual(true);
        rerender(<ZAxisAssembly {...p}
          config={{ ...p.config, kitVersion: "v1.2" }}
          version={getBotVersion("v1.2")} />);
        expect(hook).toHaveBeenLastCalledWith(
          expect.anything(), "v1.2", "utm");
      } finally {
        mesh.mockRestore();
        hook.mockRestore();
      }
    },
  );
});
