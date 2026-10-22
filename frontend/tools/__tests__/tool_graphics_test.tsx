import React from "react";
import { render } from "@testing-library/react";
import * as fiber from "@react-three/fiber";
import { FirmwareHardware } from "farmbot";
import { OrbitControls } from "@react-three/drei";
import {
  Box3, BoxGeometry, DirectionalLight as ThreeDirectionalLight, Group, Mesh,
  MeshStandardMaterial, PCFShadowMap, Sphere, Vector3,
} from "three";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  MountedToolUTM, ToolGraphic3D, ToolGraphic3DProps,
} from "../tool_graphics";
import { ToolModel } from "../../three_d_garden/bot/components/tools";
import { findElementByType } from
  "../../__test_support__/react_element_search";
import { DirectionalLight } from "../../three_d_garden/components";
import * as components from "../../three_d_garden/components";
import * as hardware from "../../three_d_garden/bot/tool_hardware";
import { ToolPreviewCamera } from "../tool_preview_camera";

describe("<ToolGraphic3D />", () => {
  let canvas: jest.SpyInstance<
    ReturnType<typeof fiber.Canvas>, Parameters<typeof fiber.Canvas>>;

  beforeEach(() => {
    canvas = jest.spyOn(fiber, "Canvas")
      .mockImplementation(() => <div className={"preview-canvas"} />);
  });

  afterEach(() => {
    canvas.mockRestore();
  });

  const fakeProps = (): ToolGraphic3DProps => ({
    toolName: "My seeder",
    toolType: "seeder",
  });

  it.each<[ToolGraphic3DProps["toolType"], number]>([
    ["seed_trough", 3],
    ["seeder", 1.2],
    ["seed_bin", 1.2],
    ["seed_tray", 1.2],
    [undefined, 1.2],
  ])("frames %s with margin %s", (toolType, margin) => {
    render(<ToolGraphic3D {...fakeProps()} toolType={toolType} />);
    const scene = canvas.mock.calls[0][0].children;
    const framing = findElementByType<
      React.ComponentProps<typeof ToolPreviewCamera>>(scene, ToolPreviewCamera);
    expect(framing?.props.margin).toEqual(margin);
  });

  it.each([
    { mounted: false, profile: false },
    { mounted: true, profile: false },
    { mounted: false, profile: true },
  ])("shows the front face with Z upright: %j", ({ mounted, profile }) => {
    render(<ToolGraphic3D {...fakeProps()} mounted={mounted} profile={profile} />);
    expect(canvas.mock.calls[0][0].camera).toEqual({
      position: [200, 0, 0], up: [0, 0, 1], zoom: 1,
    });
    expect(canvas.mock.calls[0][0].shadows).toEqual({ type: PCFShadowMap });
    expect(!!findElementByType(canvas.mock.calls[0][0].children, OrbitControls))
      .toEqual(mounted || profile);
  });

  it("fills underside details with a light below the tools", () => {
    render(<ToolGraphic3D {...fakeProps()} />);
    const scene = canvas.mock.calls[0][0].children;
    const lights = React.Children.toArray(scene)
      .filter(React.isValidElement<React.ComponentProps<typeof DirectionalLight>>)
      .filter(light => light.type === DirectionalLight);
    expect(lights).toHaveLength(2);
    expect(lights[1].props).toEqual(expect.objectContaining({
      position: [10, 10, -400],
      intensity: 1,
      castShadow: false,
    }));
  });

  const setupShadows = () => {
    render(<ToolGraphic3D {...fakeProps()} profile={true} />);
    const scene = canvas.mock.calls[0][0].children;
    const center = findElementByType<
      React.ComponentProps<typeof ToolPreviewCamera>>(scene, ToolPreviewCamera);
    const lightElement = findElementByType<
      React.ComponentProps<typeof DirectionalLight>>(scene, DirectionalLight);
    const light = new ThreeDirectionalLight();
    light.position.set(300, -200, 100);
    const ref = lightElement?.props.ref as
      React.RefObject<ThreeDirectionalLight | undefined>;
    ref.current = light;
    const container = new Group();
    const original = new Mesh(new BoxGeometry(), new MeshStandardMaterial());
    const preview = original.clone();
    container.add(preview);
    const parent = new Group();
    parent.add(container);
    const boundingBox = new Box3().setFromObject(container);
    const size = boundingBox.getSize(new Vector3());
    const centerModel = (radius: number) => center?.props.onCentered?.({
      parent,
      container,
      width: size.x,
      height: size.y,
      depth: size.z,
      boundingBox,
      boundingSphere: new Sphere(new Vector3(), radius),
      center: boundingBox.getCenter(new Vector3()),
      verticalAlignment: 0,
      horizontalAlignment: 0,
      depthAlignment: 0,
    });
    return { light, original, preview, centerModel };
  };

  it("enables cached self-shadows only on preview mesh instances", () => {
    const { light, original, preview, centerModel } = setupShadows();
    centerModel(40);
    expect(preview.castShadow).toEqual(true);
    expect(preview.receiveShadow).toEqual(true);
    expect(original.castShadow).toEqual(false);
    expect(original.receiveShadow).toEqual(false);
    expect(preview.geometry).toBe(original.geometry);
    expect(preview.material).toBe(original.material);
    expect(light.shadow.autoUpdate).toEqual(false);
    expect(light.shadow.needsUpdate).toEqual(true);
  });

  it("fits the shadow camera and refreshes it for a resized model", () => {
    const { light, centerModel } = setupShadows();
    for (const radius of [40, 200]) {
      light.shadow.needsUpdate = false;
      centerModel(radius);
      light.updateMatrixWorld();
      light.target.updateMatrixWorld();
      light.shadow.updateMatrices(light);
      expect(light.shadow.needsUpdate).toEqual(true);
      expect(light.shadow.camera.right - light.shadow.camera.left)
        .toBeLessThan(radius * 2.2);
      for (const point of [
        [radius, 0, 0], [-radius, 0, 0],
        [0, radius, 0], [0, -radius, 0],
        [0, 0, radius], [0, 0, -radius],
      ]) {
        const projected = new Vector3().fromArray(point)
          .project(light.shadow.camera);
        expect(Math.abs(projected.x)).toBeLessThan(1);
        expect(Math.abs(projected.y)).toBeLessThan(1);
        expect(Math.abs(projected.z)).toBeLessThan(1);
      }
    }
  });

  it.each([-1, NaN, Infinity])("ignores invalid model bounds: %s", radius => {
    const { light, preview, centerModel } = setupShadows();
    centerModel(radius);
    expect(preview.castShadow).toEqual(false);
    expect(light.shadow.needsUpdate).toEqual(false);
  });

  it.each([
    { mounted: false, profile: false, size: 512 },
    { mounted: true, profile: false, size: 2048 },
    { mounted: false, profile: true, size: 2048 },
  ])("sizes the shadow map for the preview: %j", ({ mounted, profile, size }) => {
    render(<ToolGraphic3D {...fakeProps()} mounted={mounted} profile={profile} />);
    const scene = canvas.mock.calls[0][0].children;
    const light = findElementByType<
      React.ComponentProps<typeof DirectionalLight>>(scene, DirectionalLight);
    expect(light?.props).toEqual(expect.objectContaining({
      castShadow: true,
      "shadow-autoUpdate": false,
      "shadow-mapSize-width": size,
      "shadow-mapSize-height": size,
    }));
  });

  it.each<[FirmwareHardware | undefined, string]>([
    ["arduino", "v1.2"],
    ["farmduino", "v1.3"],
    ["farmduino_k17", "v1.7"],
    ["farmduino_k18", "v1.8"],
    ["farmduino_k19", "v1.9"],
    [undefined, "v1.7"],
  ])("uses %s tool and UTM colors", (firmwareHardware, kitVersion) => {
    render(<ToolGraphic3D {...fakeProps()}
      firmwareHardware={firmwareHardware} mounted={true} />);
    const scene = canvas.mock.calls[0][0].children;
    const tool = findElementByType<React.ComponentProps<typeof ToolModel>>(
      scene, ToolModel);
    const utm = findElementByType<React.ComponentProps<typeof MountedToolUTM>>(
      scene, MountedToolUTM);
    expect(tool?.props.config.kitVersion).toEqual(kitVersion);
    expect(utm?.props.kitVersion).toEqual(kitVersion);
  });

  it("updates colors when the configured hardware changes", () => {
    const { rerender } = render(<ToolGraphic3D {...fakeProps()}
      firmwareHardware={"arduino"} />);
    rerender(<ToolGraphic3D {...fakeProps()}
      firmwareHardware={"farmduino_k19"} />);
    const scene = canvas.mock.calls[canvas.mock.calls.length - 1][0].children;
    const model = findElementByType<React.ComponentProps<typeof ToolModel>>(
      scene, ToolModel);
    expect(model?.props.config.kitVersion).toEqual("v1.9");
  });

  it.each([false, true])("renders a mounted tool: %s", mounted => {
    const { container } = render(<ToolGraphic3D
      {...fakeProps()} mounted={mounted} />);
    expect(container.querySelectorAll(".preview-canvas").length).toEqual(1);
    expect(container.querySelectorAll(".utm-and-mounted-tool-graphic").length)
      .toEqual(mounted
        ? 1
        : 0);
    const scene = canvas.mock.calls[0][0].children;
    const model = findElementByType<React.ComponentProps<typeof ToolModel>>(
      scene, ToolModel);
    expect(model?.props).toEqual(expect.objectContaining({
      toolName: "My seeder",
      toolType: "seeder",
      inToolbay: !mounted,
      toolPulloutDirection: ToolPulloutDirection.NONE,
    }));
    expect(!!findElementByType(scene, OrbitControls)).toEqual(mounted);
  });

  it("renders an empty slot with its pullout direction", () => {
    render(<ToolGraphic3D toolType={undefined}
      pulloutDirection={ToolPulloutDirection.NEGATIVE_Y} />);
    const scene = canvas.mock.calls[0][0].children;
    const model = findElementByType<React.ComponentProps<typeof ToolModel>>(
      scene, ToolModel);
    expect(model?.props).toEqual(expect.objectContaining({
      toolType: undefined,
      inToolbay: true,
      toolPulloutDirection: ToolPulloutDirection.NEGATIVE_Y,
    }));
  });

  it("handles an empty mounted tool", () => {
    const { container } = render(<ToolGraphic3D
      toolType={undefined} mounted={true} />);
    expect(container.querySelectorAll(".preview-canvas").length).toEqual(1);
    const scene = canvas.mock.calls[0][0].children;
    const model = findElementByType<React.ComponentProps<typeof ToolModel>>(
      scene, ToolModel);
    expect(model?.props.toolType).toBeUndefined();
    expect(model?.props.inToolbay).toEqual(false);
  });

  it("handles unavailable WebGL", () => {
    const context = jest.spyOn(HTMLCanvasElement.prototype, "getContext")
      // eslint-disable-next-line no-null/no-null
      .mockImplementation((() => null) as never);
    const { container } = render(<ToolGraphic3D {...fakeProps()} />);
    expect(container.textContent).toContain("3D graphics unavailable");
    expect(canvas).not.toHaveBeenCalled();
    context.mockRestore();
  });
});

describe("<MountedToolUTM />", () => {
  it.each(["v1.2", "v1.3", "v1.7", "v1.8", "v1.9"])(
    "uses the gold-barb material for %s", kitVersion => {
      const material = new MeshStandardMaterial();
      const hook = jest.spyOn(hardware, "useToolMaterials")
        .mockReturnValue({ material, hardwareMaterial: material });
      const Mesh = components.Mesh;
      const mesh = jest.spyOn(components, "Mesh")
        .mockImplementation(props => <Mesh {...props} />);
      try {
        render(<MountedToolUTM kitVersion={kitVersion} />);
        expect(hook).toHaveBeenCalledWith(expect.anything(), kitVersion, "utm");
        expect(mesh.mock.calls[0][0].material).toBe(material);
      } finally {
        mesh.mockRestore();
        hook.mockRestore();
      }
    },
  );
});
