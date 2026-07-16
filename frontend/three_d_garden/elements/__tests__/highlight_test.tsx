import React from "react";
import { act, render } from "@testing-library/react";
import * as reactThreeFiber from "@react-three/fiber";
import { EffectComposer } from
  "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutlinePass } from
  "three/examples/jsm/postprocessing/OutlinePass.js";
import {
  PerspectiveCamera, Scene, Vector2, type WebGLRenderer,
} from "three";
import {
  HIGHLIGHT_ALL, Highlight, HighlightProvider,
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
      <Highlight highlightName={"test"}
        label={"Label"}>
        <mesh name={"content"} />
      </Highlight>
    </HighlightProvider>);

    expect(container.querySelector("[name='test-highlight']")).toBeTruthy();
    expect(container.querySelector("[name='content']")).toBeTruthy();
    expect(container.querySelector("[name='test-label']")).toBeNull();
    expect(frameSpy).not.toHaveBeenCalled();

    render(<HighlightProvider highlighted3DObject={"hidden"}>
      <Highlight highlightName={"other"} visible={false} />
    </HighlightProvider>);
    expect(frameSpy).not.toHaveBeenCalled();
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
        <Highlight highlightName={"first"}
          label={"First"}>
          <mesh />
        </Highlight>
        <Highlight highlightName={"second"}
          label={"Second"}>
          <mesh />
        </Highlight>
      </HighlightProvider>;
    const { container, rerender } = render(view(HIGHLIGHT_ALL));

    const firstHighlight = container.querySelector("[name='first-highlight']");
    const firstLabel = firstHighlight?.querySelector("[name='first-label']");
    expect(firstLabel).toBeTruthy();
    expect(firstHighlight?.querySelector("[name='first-highlight-selection']")
      ?.querySelector("[name='first-label']")).toBeNull();
    act(() => renderFrame?.({} as never, 0.1));
    expect(renderSpy).toHaveBeenCalledWith(0.1);
    rerender(view("second"));
    expect(composerDisposeSpy).toHaveBeenCalledTimes(1);
    expect(outlineDisposeSpy).toHaveBeenCalledTimes(1);
    rerender(view());
    expect(composerDisposeSpy).toHaveBeenCalledTimes(2);
    expect(outlineDisposeSpy).toHaveBeenCalledTimes(2);
  });
});
