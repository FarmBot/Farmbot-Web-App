import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import * as fiber from "@react-three/fiber";
import { OrthographicCamera, Scene } from "three";
import * as graphics from "../tool_graphics";
import { ToolPreviewPanel, ToolPreviewView } from "../tool_preview_panel";

describe("<ToolPreviewPanel />", () => {
  let canvas: jest.SpiedFunction<typeof fiber.Canvas>;
  let frame: jest.SpiedFunction<typeof fiber.useFrame>;
  let scene: jest.SpiedFunction<typeof graphics.ToolGraphicScene>;
  const invalidate = jest.fn();
  const disconnect = jest.fn();
  const resizeCallbacks = new Map<Element, ResizeObserverCallback>();

  beforeEach(() => {
    invalidate.mockClear();
    disconnect.mockClear();
    resizeCallbacks.clear();
    canvas = jest.spyOn(fiber, "Canvas").mockImplementation(({ children }) =>
      <div>{children}</div>);
    frame = jest.spyOn(fiber, "useFrame").mockImplementation(jest.fn());
    scene = jest.spyOn(graphics, "ToolGraphicScene").mockImplementation(() =>
      <div />);
    jest.spyOn(globalThis, "ResizeObserver").mockImplementation(callback => ({
      disconnect,
      unobserve: jest.fn(),
      observe: target => {
        resizeCallbacks.set(target, callback);
        Object.defineProperties(target, {
          clientWidth: { configurable: true, value: 50 },
          clientHeight: { configurable: true, value: 60 },
        });
        callback([], {} as ResizeObserver);
      },
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("clips the viewports and attaches orbit controls to the preview", () => {
    const { container, unmount } = render(<ToolPreviewPanel hasTools={true}>
      <ToolPreviewView mounted={true} toolType={"seeder"} />
      <ToolPreviewView toolType={"watering_nozzle"} />
    </ToolPreviewPanel>);
    const [mounted, offscreen] = container.querySelectorAll(".tool-graphic-3d");
    jest.spyOn(mounted, "getBoundingClientRect")
      .mockReturnValue(new DOMRect(20, 90, 50, 60));
    jest.spyOn(offscreen, "getBoundingClientRect")
      .mockReturnValue(new DOMRect(20, 340, 50, 60));
    const gl = {
      domElement: { getBoundingClientRect: () => new DOMRect(10, 100, 180, 200) },
      autoClear: true,
      clear: jest.fn(),
      setViewport: jest.fn(),
      setScissor: jest.fn(),
      setScissorTest: jest.fn(),
      render: jest.fn(),
    };
    const state = { gl, invalidate } as unknown as fiber.RootState;
    const canvasProps = canvas.mock.calls[canvas.mock.calls.length - 1][0];
    expect(canvasProps.style?.pointerEvents).toEqual("none");
    canvasProps.onCreated?.(state);
    expect(gl.autoClear).toBe(false);

    fireEvent.scroll(container.querySelector(".tools-panel-content") as Element);
    expect(invalidate).toHaveBeenCalledTimes(1);
    const clear = frame.mock.calls.find(([, priority]) => priority == 1);
    clear?.[0](state, 0);
    const views = frame.mock.calls.filter(([, priority]) => priority == 2);
    for (const [callback] of views.slice(-2)) {
      callback(state, 0);
    }
    expect(gl.clear).toHaveBeenCalledTimes(1);
    expect(gl.setViewport).toHaveBeenCalledWith(10, 150, 50, 60);
    expect(gl.setScissor).toHaveBeenCalledWith(10, 150, 50, 50);
    expect(gl.render).toHaveBeenCalledTimes(1);
    expect(gl.render).toHaveBeenCalledWith(
      expect.any(Scene), expect.any(OrthographicCamera));
    expect(scene.mock.calls).toContainEqual([expect.objectContaining({
      toolType: "seeder", orbitTarget: mounted,
      viewportSize: { width: 50, height: 60 },
    }), undefined]);
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it("updates scene framing when the preview changes size", () => {
    const { container } = render(<ToolPreviewPanel hasTools={true}>
      <ToolPreviewView toolType={"seeder"} />
    </ToolPreviewPanel>);
    const target = container.querySelector(".tool-graphic-3d");
    if (!target) { throw new Error("Missing tool preview target"); }
    const resize = resizeCallbacks.get(target);
    if (!resize) { throw new Error("Missing tool preview resize callback"); }
    const notifyResize = () => act(() => resize([], {} as ResizeObserver));
    scene.mockClear();
    notifyResize();
    expect(scene).not.toHaveBeenCalled();
    Object.defineProperties(target, {
      clientWidth: { value: 80 },
      clientHeight: { value: 90 },
    });
    notifyResize();
    expect(scene).toHaveBeenLastCalledWith(expect.objectContaining({
      orbitTarget: target,
      viewportSize: { width: 80, height: 90 },
    }), undefined);
  });

  it("releases the single WebGL probe used by all views", () => {
    const loseContext = jest.fn();
    const getExtension = jest.fn(() => ({ loseContext }));
    const getContext = jest.spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation((() => ({ getExtension })) as never);
    const { rerender } = render(<ToolPreviewPanel hasTools={true}>
      <ToolPreviewView toolType={"seeder"} />
      <ToolPreviewView toolType={"watering_nozzle"} />
    </ToolPreviewPanel>);
    rerender(<ToolPreviewPanel hasTools={true}>
      <ToolPreviewView toolType={"seeder"} />
    </ToolPreviewPanel>);
    expect(getContext).toHaveBeenCalledTimes(1);
    expect(getContext).toHaveBeenCalledWith("webgl2");
    expect(getExtension).toHaveBeenCalledWith("WEBGL_lose_context");
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it("keeps tool controls available when WebGL is unavailable", () => {
    jest.spyOn(graphics, "toolPreviewAvailable").mockReturnValue(false);
    render(<ToolPreviewPanel hasTools={true}>
      <ToolPreviewView toolType={"seeder"} />
      <button>Tool settings</button>
    </ToolPreviewPanel>);
    expect(screen.getByRole("button", { name: "Tool settings" })).toBeEnabled();
    expect(screen.getByRole("status")).toHaveTextContent("3D graphics unavailable");
    expect(canvas).not.toHaveBeenCalled();
  });
});
