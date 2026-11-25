import React from "react";
import { render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import { ASSETS, LIB_DIR } from "../../../constants";
import { MeshStandardMaterial, Object3D } from "three";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { getBotVersion } from "../../bot_versions";
import { ZAxisAssembly, ZAxisAssemblyProps } from "../z_axis";
import * as hardware from "../../tool_hardware";
import * as components from "../../../components";
import {
  createRenderer, unmountRenderer,
} from "../../../../__test_support__/test_renderer";

describe("<ZAxisAssembly />", () => {
  const fakeProps = (): ZAxisAssemblyProps => ({
    config: { ...INITIAL },
    configPosition: { ...INITIAL_POSITION },
    version: getBotVersion(INITIAL.kitVersion),
    zAxisShape: undefined,
    trailReady: false,
    trailTarget: { current: new Object3D() },
  });

  it.each(["v1.7", "v1.8", "v1.9"])(
    "keeps the vacuum pump on the correct assembly for %s", kitVersion => {
      const p = fakeProps();
      p.config.kitVersion = kitVersion;
      p.version = getBotVersion(kitVersion);
      const { container } = render(<ZAxisAssembly {...p} />);
      const pump = container.querySelector("[name='vacuumPump']");
      expect(Boolean(pump)).toEqual(kitVersion != "v1.9");
    },
  );

  it("requests the updated UTM model with a cache-busting version", () => {
    render(<ZAxisAssembly {...fakeProps()} />);
    expect(useGLTF).toHaveBeenCalledWith(
      ASSETS.models.utm, LIB_DIR);
    expect(ASSETS.models.utm).toMatch(/utm\.glb\?v=[a-f0-9]{64}$/);
  });

  it("applies the UTM magnet transform in millimeters", () => {
    const { container } = render(<ZAxisAssembly {...fakeProps()} />);
    const utm = container.querySelector("[name='UTM'] mesh");
    expect(utm).toHaveAttribute("position", "-11,-6,17");
    expect(utm).toHaveAttribute("rotation", `${Math.PI},0,-2.094`);
    expect(utm).toHaveAttribute("scale", "1000");
  });

  it("uses precise edge matching for the UTM magnet", () => {
    const wrapper = createRenderer(<ZAxisAssembly {...fakeProps()} />);
    const [utm] = wrapper.root.findAllByProps({ name: "UTM" });
    const mesh = utm.findByType(components.Mesh);
    expect(mesh.props.userData).toEqual({ preciseModelEdges: true });
    unmountRenderer(wrapper);
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
