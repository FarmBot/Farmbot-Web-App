import React from "react";
import { act, render, renderHook } from "@testing-library/react";
import {
  createPanelCameraStore, PanelCameraController, selectPanelCamera,
  selectPanelInvalidate, selectPanelViewportHeight,
  selectPanelViewportWidth,
} from "../panel_camera";
import { PerspectiveCamera } from "three";
import { RootState } from "@react-three/fiber";

describe("panel camera store", () => {
  it("selects only camera controller state", () => {
    const camera = new PerspectiveCamera();
    const invalidate = jest.fn();
    const size = { width: 1200, height: 600 };
    const state = {
      camera,
      invalidate,
      size,
    } as unknown as RootState;

    expect(selectPanelCamera(state)).toBe(camera);
    expect(selectPanelInvalidate(state)).toBe(invalidate);
    expect(selectPanelViewportWidth(state)).toEqual(1200);
    expect(selectPanelViewportHeight(state)).toEqual(600);
  });

  it("notifies only when the panel state changes", () => {
    const store = createPanelCameraStore(true);
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    expect(store.getSnapshot()).toBeTruthy();
    act(() => store.setOpen(true));
    expect(listener).not.toHaveBeenCalled();

    act(() => store.setOpen(false));
    expect(store.getSnapshot()).toBeFalsy();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    act(() => store.setOpen(true));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("supports isolated React subscriptions", () => {
    const store = createPanelCameraStore(true);
    const { result } = renderHook(() => React.useSyncExternalStore(
      store.subscribe,
      store.getSnapshot,
      store.getSnapshot,
    ));
    expect(result.current).toBeTruthy();

    act(() => store.setOpen(false));
    expect(result.current).toBeFalsy();
  });

  it("renders once for each panel state change", () => {
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    const store = createPanelCameraStore(true);
    const view = render(<PanelCameraController store={store} />);
    expect(window.__fbPerf?.counts["render.PanelCameraController"])
      .toEqual(1);

    view.rerender(<PanelCameraController store={store} />);
    act(() => store.setOpen(true));
    expect(window.__fbPerf?.counts["render.PanelCameraController"])
      .toEqual(1);

    for (let cycle = 0; cycle < 10; cycle++) {
      act(() => store.setOpen(false));
      act(() => store.setOpen(true));
    }
    expect(window.__fbPerf?.counts["render.PanelCameraController"])
      .toEqual(21);
  });
});
