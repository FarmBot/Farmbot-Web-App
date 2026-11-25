import React from "react";
import { render } from "@testing-library/react";
import * as fiber from "@react-three/fiber";
import {
  AmbientLight, BoxGeometry, Color, Group, Mesh, PerspectiveCamera, Scene,
  Vector3, Vector4, WebGLRenderTarget,
} from "three";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { Color as UiColor } from "../../ui/colors";
import {
  SlotScenePreview, ToolScenePreviewBridge, ToolScenePreviewContext,
  ToolScenePreviewRenderer,
} from "../tool_scene_preview";

describe("tool scene preview", () => {
  afterEach(() => jest.restoreAllMocks());

  it("uses the standalone preview when the garden view is unavailable", () => {
    const { getByText } = render(<SlotScenePreview slotId={7}>
      <div>Standalone slot preview</div>
    </SlotScenePreview>);
    expect(getByText("Standalone slot preview")).toBeInTheDocument();
  });

  it("registers only saved slots and releases the canvas on close", () => {
    const bridge: ToolScenePreviewBridge = {};
    const preview = (slotId: number | undefined) =>
      <ToolScenePreviewContext.Provider value={bridge}>
        <SlotScenePreview slotId={slotId}>Standalone slot preview</SlotScenePreview>
      </ToolScenePreviewContext.Provider>;
    const { container, rerender, unmount } = render(preview(undefined));
    expect(bridge.current).toBeUndefined();
    rerender(preview(7));
    expect(bridge.current).toEqual({
      subject: 7,
      canvas: container.querySelector(".slot-scene-preview"),
    });
    rerender(preview(8));
    expect(bridge.current).toEqual(expect.objectContaining({ subject: 8 }));
    unmount();
    expect(bridge.current).toBeUndefined();
  });

  it.each([false, true])("frames the live slot (empty %s)", empty => {
    const now = jest.spyOn(performance, "now").mockReturnValue(100);
    const subscribe = jest.spyOn(fiber, "useFrame").mockImplementation(jest.fn());
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) { throw new Error("Missing 2D canvas mock"); }
    const getContext = jest.spyOn(canvas, "getContext");
    const slot = new Group();
    slot.userData = { toolSlotId: 7 };
    const selectedTool = empty ? new Group() : new Mesh(new BoxGeometry(20, 20, 20));
    slot.add(selectedTool);
    const otherSlot = new Group();
    otherSlot.userData.toolSlotId = 8;
    const light = new AmbientLight();
    const crosshair = new Mesh();
    crosshair.name = "selected-object-x-crosshair";
    const selectionRing = new Mesh();
    selectionRing.name = "selected-object-ring";
    const hiddenCrosshair = new Mesh();
    hiddenCrosshair.name = "grid-hover-y-crosshair";
    hiddenCrosshair.visible = false;
    const garden = new Scene();
    const background = new Color("white");
    garden.background = background;
    garden.add(slot, otherSlot, light, crosshair, selectionRing, hiddenCrosshair);
    const outline = jest.spyOn(OutlinePass.prototype, "render")
      .mockImplementation(function (this: OutlinePass) {
        expect(this.selectedObjects).toEqual([slot]);
        expect(this.visibleEdgeColor).toEqual(new Color(UiColor.yellow));
        expect(this.edgeGlow).toBe(1);
        expect(this.edgeThickness).toBe(0.75);
        expect(this.downSampleRatio).toBe(1);
        expect(this.renderTargetMaskDownSampleBuffer.width).toBe(800);
        expect(this.edgeDetectionMaterial.uniforms.outlineSampleRadius.value)
          .toBe(0.5);
        expect(this.edgeDetectionMaterial.fragmentShader)
          .toContain("vec4(invSize, invSize) * outlineSampleRadius");
        expect(this.edgeDetectionMaterial.fragmentShader)
          .toContain("smoothstep(0.0, 0.2, length(vec2(diff1, diff2)))");
        expect(this.separableBlurMaterial2.uniforms.kernelRadius.value).toBe(1);
        expect(crosshair.visible).toBe(false);
        expect(selectionRing.visible).toBe(false);
      });
    const renderOutput = jest.spyOn(OutputPass.prototype, "render")
      .mockImplementation(jest.fn());
    const bridge: ToolScenePreviewBridge = { current: { subject: 7, canvas } };
    const { unmount } = render(<ToolScenePreviewRenderer bridge={bridge} />);
    const draw = subscribe.mock.calls[0][0];
    jest.spyOn(canvas, "getBoundingClientRect")
      .mockReturnValue(new DOMRect(0, 20, 400, 200));
    const source = document.createElement("canvas");
    source.width = 1800;
    source.height = 1200;
    const priorViewport = new Vector4(10, 15, 450, 300);
    const priorScissor = new Vector4(0, 0, 450, 300);
    const capturePass = (scene: Scene, camera: PerspectiveCamera) => ({
      scene, camera, background: scene.background,
      selected: camera.layers.test(selectedTool.layers),
      other: camera.layers.test(otherSlot.layers),
      lighting: camera.layers.test(light.layers),
      crosshair: crosshair.visible, ring: selectionRing.visible,
    });
    const gl = {
      autoClear: true, domElement: source, shadowMap: { autoUpdate: true },
      getRenderTarget: jest.fn(), setRenderTarget: jest.fn(), getPixelRatio: () => 2,
      getViewport: (target: Vector4) => target.copy(priorViewport),
      getScissor: (target: Vector4) => target.copy(priorScissor),
      getScissorTest: () => false,
      setViewport: jest.fn(), setScissor: jest.fn(), setScissorTest: jest.fn(),
      render: jest.fn(capturePass),
    };
    const state = { gl, scene: garden } as unknown as fiber.RootState;
    draw(state, 0);
    expect(getContext).toHaveBeenCalledWith("2d");
    const passes = gl.render.mock.results.map(result =>
      result.value as ReturnType<typeof capturePass>);
    expect(passes).toHaveLength(3);
    expect(passes[0]).toEqual(expect.objectContaining({
      scene: garden, camera: expect.any(PerspectiveCamera),
      background, selected: true, other: true, lighting: true,
      crosshair: false, ring: false,
    }));
    const camera = passes[0].camera;
    expect(camera.position.length()).toBeCloseTo(280);
    expect(camera.position.clone().normalize()
      .distanceTo(new Vector3(1, -1, 1).normalize())).toBeCloseTo(0);
    expect(passes[1].scene.children).toEqual([expect.objectContaining({
      material: expect.objectContaining({
        opacity: 0.62, transparent: true, depthWrite: false,
      }),
    })]);
    expect(passes[2]).toEqual(expect.objectContaining({
      scene: garden, selected: true, other: false, lighting: true,
    }));
    const target = gl.setRenderTarget.mock.calls[0][0] as WebGLRenderTarget;
    expect(target.width).toBe(800);
    expect(target.height).toBe(400);
    expect(target.samples).toBe(2);
    expect(target.resolveDepthBuffer).toBe(false);
    expect(outline).toHaveBeenCalledWith(gl, target, target, 0, false);
    expect(renderOutput).toHaveBeenCalledWith(gl, target, target, 0, false);
    // eslint-disable-next-line no-null/no-null
    expect(gl.setRenderTarget).toHaveBeenLastCalledWith(null);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 400);
    expect(ctx.drawImage).toHaveBeenCalledWith(source,
      0, 800, 800, 400, 0, 0, 800, 400);
    expect(selectedTool.layers.mask).toBe(1);
    expect(light.layers.mask).toBe(1);
    expect(garden.background).toBe(background);
    expect(gl.shadowMap.autoUpdate).toBe(true);
    expect(gl.autoClear).toBe(true);
    expect(gl.setViewport).toHaveBeenLastCalledWith(priorViewport);
    expect(gl.setScissor).toHaveBeenLastCalledWith(priorScissor);
    expect(gl.setScissorTest).toHaveBeenLastCalledWith(false);
    expect(crosshair.visible).toBe(true);
    expect(selectionRing.visible).toBe(true);
    expect(hiddenCrosshair.visible).toBe(false);

    const startX = camera.position.x;
    slot.position.x += 60;
    now.mockReturnValue(100 + 1000 / 120);
    draw(state, 1 / 120);
    expect(camera.position.x).toBeCloseTo(startX + 60);
    expect(ctx.drawImage).toHaveBeenCalledTimes(2);

    gl.getRenderTarget.mockReturnValueOnce(target);
    draw(state, 1 / 120);
    expect(ctx.drawImage).toHaveBeenCalledTimes(2);

    bridge.current = undefined;
    gl.render.mockClear();
    draw(state, 0);
    expect(gl.render).not.toHaveBeenCalled();
    unmount();
  });

  it("keeps the UTM view fixed when the mounted model changes", () => {
    const subscribe = jest.spyOn(fiber, "useFrame").mockImplementation(jest.fn());
    jest.spyOn(OutputPass.prototype, "render").mockImplementation(jest.fn());
    const view = jest.fn();
    const outline = jest.spyOn(OutlinePass.prototype, "render")
      .mockImplementation(function (this: OutlinePass) {
        view([...this.selectedObjects], this.renderCamera);
      });
    const canvas = document.createElement("canvas");
    jest.spyOn(canvas, "getBoundingClientRect")
      .mockReturnValue(new DOMRect(0, 20, 450, 200));
    const source = document.createElement("canvas");
    source.width = 1800;
    source.height = 1200;
    const gl = {
      autoClear: true, domElement: source, shadowMap: { autoUpdate: true },
      getRenderTarget: jest.fn(), setRenderTarget: jest.fn(), getPixelRatio: () => 2,
      getViewport: jest.fn(), getScissor: jest.fn(), getScissorTest: () => false,
      setViewport: jest.fn(), setScissor: jest.fn(), setScissorTest: jest.fn(),
      render: jest.fn(),
    };
    const scene = new Scene();
    const zAxis = new Group();
    zAxis.name = "bot-z-axis";
    zAxis.position.set(80, 20, 40);
    const utmGroup = new Group();
    utmGroup.name = "utm-highlight-selection";
    const utm = new Mesh(new BoxGeometry(60, 80, 40));
    utm.name = "UTM";
    utmGroup.add(utm);
    zAxis.add(utmGroup);
    const ghost = utmGroup.clone();
    scene.add(ghost);
    const bridge: ToolScenePreviewBridge = { current: { subject: "utm", canvas } };
    render(<ToolScenePreviewRenderer bridge={bridge} />);
    const draw = subscribe.mock.calls[0][0];
    const state = { gl, scene } as unknown as fiber.RootState;
    draw(state, 0);
    expect(outline).not.toHaveBeenCalled();

    scene.add(zAxis);
    draw(state, 0);
    const camera = view.mock.calls[0][1] as PerspectiveCamera;
    const anchor = utm.getWorldPosition(new Vector3());
    const target = anchor.clone().add(new Vector3(0, 0, -35));
    expect(view).toHaveBeenLastCalledWith([utmGroup], camera);
    expect(camera.position.clone().sub(anchor)
      .distanceTo(new Vector3(310, 0, -35))).toBeCloseTo(0);
    expect(camera.getWorldDirection(new Vector3())
      .distanceTo(new Vector3(-1, 0, 0))).toBeCloseTo(0);
    expect([canvas.width, canvas.height]).toEqual([900, 400]);
    const projection = camera.projectionMatrix.clone();

    const tool = new Group();
    tool.name = "utm-highlight-selection";
    const toolMesh = new Mesh(new BoxGeometry(50, 50, 100));
    toolMesh.position.z = -80;
    tool.add(toolMesh);
    zAxis.add(tool);
    const initialPosition = camera.position.clone();
    const initialRotation = camera.quaternion.clone();
    draw(state, 0);
    expect(view).toHaveBeenLastCalledWith([utmGroup, tool], camera);
    expect(camera.position.distanceTo(initialPosition)).toBeCloseTo(0);
    expect(camera.quaternion.angleTo(initialRotation)).toBeCloseTo(0);
    expect(camera.projectionMatrix).toEqual(projection);

    camera.position.set(300, 130, 60);
    camera.lookAt(target);
    const orbitedPosition = camera.position.clone();
    const orbitedRotation = camera.quaternion.clone();
    zAxis.remove(tool);
    utmGroup.remove(utm).add(utm.clone());
    draw(state, 0);
    expect(view).toHaveBeenLastCalledWith([utmGroup], camera);
    expect(camera.position.distanceTo(orbitedPosition)).toBeCloseTo(0);
    expect(camera.quaternion.angleTo(orbitedRotation)).toBeCloseTo(0);
    expect(camera.projectionMatrix).toEqual(projection);
    expect([canvas.width, canvas.height]).toEqual([900, 400]);

    zAxis.position.x += 40;
    draw(state, 0);
    expect(camera.position.x).toBeCloseTo(orbitedPosition.x + 40);
    expect(camera.quaternion.angleTo(orbitedRotation)).toBeCloseTo(0);
  });
});
