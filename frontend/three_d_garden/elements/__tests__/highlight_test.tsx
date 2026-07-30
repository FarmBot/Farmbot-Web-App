import React from "react";
import { act, render } from "@testing-library/react";
import * as reactThreeFiber from "@react-three/fiber";
import { EffectComposer } from
  "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutlinePass } from
  "three/examples/jsm/postprocessing/OutlinePass.js";
import {
  Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector2,
  type WebGLRenderer,
} from "three";
import {
  configureObjectIdOutlinePass, HIGHLIGHT_ALL, Highlight, HighlightProvider,
} from "../highlight";

describe("<Highlight />", () => {
  const fakeRenderer = () => ({
    getPixelRatio: jest.fn(() => 1),
    getSize: jest.fn((target: Vector2) => target.set(800, 600)),
  }) as unknown as WebGLRenderer;

  it("renders inactive content without the outline renderer", () => {
    const frameSpy = jest.spyOn(reactThreeFiber, "useFrame")
      .mockImplementation(jest.fn());
    const { container } = render(<HighlightProvider>
      <Highlight highlightName={"test"}>
        <mesh name={"content"} />
      </Highlight>
    </HighlightProvider>);

    expect(container.querySelector("[name='test-highlight']")).toBeTruthy();
    expect(container.querySelector("[name='content']")).toBeTruthy();
    expect(frameSpy).not.toHaveBeenCalled();

    render(<HighlightProvider highlighted3DObject={"hidden"}>
      <Highlight highlightName={"other"} visible={false} />
    </HighlightProvider>);
    expect(frameSpy).not.toHaveBeenCalled();

    const standalone = render(<Highlight highlightName={"standalone"}>
      <mesh name={"standalone-content"} />
    </Highlight>);
    expect(standalone.container.querySelector(
      "[name='standalone-content']")).toBeTruthy();
  });

  it("renders and cleans up outlines for all active wrappers", () => {
    let renderFrame: ((state: never, delta: number) => void) | undefined;
    jest.spyOn(reactThreeFiber, "useThree").mockReturnValue({
      gl: fakeRenderer(),
      scene: new Scene(),
      camera: new PerspectiveCamera(),
      size: { width: 800, height: 600 },
    });
    jest.spyOn(reactThreeFiber, "useFrame")
      .mockImplementation(callback => {
        renderFrame = callback;
        // eslint-disable-next-line no-null/no-null
        return null;
      });
    const renderSpy = jest.spyOn(EffectComposer.prototype, "render")
      .mockImplementation(jest.fn());
    const composerDisposeSpy = jest.spyOn(EffectComposer.prototype, "dispose")
      .mockImplementation(jest.fn());
    const outlineDisposeSpy = jest.spyOn(OutlinePass.prototype, "dispose")
      .mockImplementation(jest.fn());
    const view = (highlighted3DObject?: string) =>
      <HighlightProvider highlighted3DObject={highlighted3DObject}>
        <Highlight highlightName={"first"}>
          <mesh />
        </Highlight>
        <Highlight highlightName={"second"}>
          <mesh />
        </Highlight>
      </HighlightProvider>;
    const { rerender } = render(view(HIGHLIGHT_ALL));
    act(() => renderFrame?.({} as never, 0.1));
    expect(renderSpy).toHaveBeenCalledWith(0.1);
    rerender(view("second"));
    expect(composerDisposeSpy).toHaveBeenCalledTimes(1);
    expect(outlineDisposeSpy).toHaveBeenCalledTimes(1);
    rerender(view());
    expect(composerDisposeSpy).toHaveBeenCalledTimes(2);
    expect(outlineDisposeSpy).toHaveBeenCalledTimes(2);
  });

  it("assigns separate mask IDs to clickable object groups", () => {
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    const firstRoot = new Group();
    const firstMesh = new Mesh(undefined, new MeshBasicMaterial());
    const secondRoot = new Group();
    const secondMesh = new Mesh(undefined, new MeshBasicMaterial());
    const matchingRoot = new Group();
    const matchingMesh = new Mesh(undefined, new MeshBasicMaterial());
    firstRoot.add(firstMesh, secondRoot);
    secondRoot.add(secondMesh);
    matchingRoot.add(matchingMesh);
    scene.add(firstRoot, matchingRoot);
    const outlinePass = new OutlinePass(
      new Vector2(800, 600),
      scene,
      camera,
      [firstRoot, secondRoot, matchingRoot],
    );
    const originalBeforeRender = outlinePass.prepareMaskMaterial.onBeforeRender;
    const restore = configureObjectIdOutlinePass(outlinePass, [
      { highlightName: "first", object: firstRoot },
      { highlightName: "second", object: secondRoot },
      { highlightName: "first", object: matchingRoot },
    ]);
    const renderId = (mesh: Mesh, uniformUpdate = true) => {
      outlinePass.prepareMaskMaterial.uniformsNeedUpdate = false;
      outlinePass.prepareMaskMaterial.onBeforeRender(
        fakeRenderer(),
        scene,
        camera,
        mesh.geometry,
        mesh,
        new Group(),
      );
      expect(outlinePass.prepareMaskMaterial.uniformsNeedUpdate)
        .toEqual(uniformUpdate);
      return outlinePass.prepareMaskMaterial.uniforms.highlightObjectId.value;
    };

    const firstId = renderId(firstMesh);
    expect(renderId(matchingMesh, false)).toEqual(firstId);
    expect(renderId(secondMesh)).not.toEqual(firstId);
    expect(outlinePass.prepareMaskMaterial.fragmentShader)
      .toContain("vec4(highlightObjectId, depthTest");
    expect(outlinePass.edgeDetectionMaterial.fragmentShader)
      .toContain("float d = 0.3");
    expect(outlinePass.overlayMaterial.fragmentShader)
      .toContain("edgeStrength * edgeValue");

    restore();
    expect(outlinePass.prepareMaskMaterial.onBeforeRender)
      .toBe(originalBeforeRender);
    outlinePass.dispose();

    const incompatiblePass = new OutlinePass(
      new Vector2(800, 600), scene, camera);
    incompatiblePass.prepareMaskMaterial.fragmentShader = "";
    expect(() => configureObjectIdOutlinePass(incompatiblePass, []))
      .toThrow("Unable to configure the object-ID outline shader.");
    incompatiblePass.dispose();
  });
});
