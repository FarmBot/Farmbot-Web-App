import React from "react";
import { act, render } from "@testing-library/react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  CableCarrierX, CableCarrierY, CableCarrierZ,
  CableCarrierSupportVertical, CableCarrierSupportVerticalProps,
  CableCarrierSupportHorizontal, CableCarrierSupportHorizontalProps,
  buildCableCarrierShape,
} from "../cable_carriers";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { ASSETS } from "../../../constants";
import { ExtrudeGeometry, Object3D, Shape, Vector3 } from "three";

const useGltfMock = useGLTF as unknown as jest.Mock;

beforeEach(() => {
  useGltfMock.mockClear();
});

describe("moving cable carriers", () => {
  const fakeProps = () => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it.each([0, 500, 1000])("builds a carrier at axis position %s", position => {
    const shape = buildCableCarrierShape(1000, position, 70);
    expect(shape.getPoints()).not.toHaveLength(0);
  });

  it("skips disabled moving carriers", () => {
    const p = fakeProps();
    p.config.cableCarriers = false;
    const moveToSpy = jest.spyOn(Shape.prototype, "moveTo");
    const { container, rerender } = render(<>
      <CableCarrierX {...p} />
      <CableCarrierY {...p} />
      <CableCarrierZ {...p} />
    </>);
    expect(container.querySelectorAll("extrude").length).toBe(0);
    expect(moveToSpy).not.toHaveBeenCalled();
    const updatedProps = fakeProps();
    updatedProps.config.cableCarriers = false;
    updatedProps.configPosition.z += 10;
    rerender(<>
      <CableCarrierX {...updatedProps} />
      <CableCarrierY {...updatedProps} />
      <CableCarrierZ {...updatedProps} />
    </>);
    expect(moveToSpy).not.toHaveBeenCalled();
    moveToSpy.mockRestore();
  });

  it("memoizes moving carriers by relevant axes", () => {
    const p = fakeProps();
    const moveToSpy = jest.spyOn(Shape.prototype, "moveTo");
    const Carriers = (props: typeof p) => <React.Fragment>
      <CableCarrierX {...props} />
      <CableCarrierY {...props} />
      <CableCarrierZ {...props} />
    </React.Fragment>;
    const { rerender } = render(<Carriers {...p} />);
    expect(moveToSpy).toHaveBeenCalledTimes(3);
    rerender(<Carriers {...p} configPosition={{
      ...p.configPosition, z: p.configPosition.z + 10,
    }} />);
    expect(moveToSpy).toHaveBeenCalledTimes(4);
    rerender(<Carriers {...p} configPosition={{
      ...p.configPosition, y: p.configPosition.y + 10,
      z: p.configPosition.z + 10,
    }} />);
    expect(moveToSpy).toHaveBeenCalledTimes(5);
    rerender(<Carriers {...p} configPosition={{
      ...p.configPosition, x: p.configPosition.x + 10,
      y: p.configPosition.y + 10,
      z: p.configPosition.z + 10,
    }} />);
    expect(moveToSpy).toHaveBeenCalledTimes(6);
    moveToSpy.mockRestore();
  });

  it("renders v1.8 Y carrier depth", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const moveToSpy = jest.spyOn(Shape.prototype, "moveTo");
    const { container } = render(<CableCarrierY {...p} />);
    expect(container.innerHTML).toContain("yCC");
    expect(moveToSpy).toHaveBeenCalledTimes(1);
    moveToSpy.mockRestore();
  });

  it("sizes the Y carrier by beam length", () => {
    const p = fakeProps();
    const moveToSpy = jest.spyOn(Shape.prototype, "moveTo");
    const { rerender } = render(<CableCarrierY {...p} />);
    expect(moveToSpy).toHaveBeenCalledTimes(1);
    rerender(<CableCarrierY {...p} config={{
      ...p.config,
      botSizeY: p.config.botSizeY + 10,
    }} />);
    expect(moveToSpy).toHaveBeenCalledTimes(1);
    rerender(<CableCarrierY {...p} config={{
      ...p.config,
      beamLength: p.config.beamLength + 10,
    }} />);
    expect(moveToSpy).toHaveBeenCalledTimes(2);
    moveToSpy.mockRestore();
  });

  it("disposes replaced and unmounted moving carrier geometry", () => {
    const p = fakeProps();
    const disposeSpy = jest.spyOn(ExtrudeGeometry.prototype, "dispose");
    const { rerender, unmount } = render(<CableCarrierX {...p} />);
    rerender(<CableCarrierX {...p} configPosition={{
      ...p.configPosition,
      x: p.configPosition.x + 10,
    }} />);
    expect(disposeSpy).toHaveBeenCalledTimes(1);
    unmount();
    expect(disposeSpy).toHaveBeenCalledTimes(2);
    disposeSpy.mockRestore();
  });

  it("deforms and translates carriers inside the render frame", () => {
    const frameCallbacks: Parameters<typeof useFrame>[0][] = [];
    (useFrame as jest.Mock).mockImplementation(
      (callback: Parameters<typeof useFrame>[0]) => {
        frameCallbacks.push(callback);
        return undefined;
      });
    const p = fakeProps();
    const positionRef = { current: { ...p.configPosition } };
    const { container, unmount } = render(<CableCarrierY
      {...p}
      local={true}
      positionRef={positionRef} />);
    const mesh = container.querySelector("mesh") as unknown as {
      geometry: ExtrudeGeometry;
      position: Vector3;
    };
    mesh.position = new Vector3();
    positionRef.current = {
      ...positionRef.current,
      x: positionRef.current.x + 10,
      y: positionRef.current.y + 20,
    };

    act(() => frameCallbacks.forEach(callback =>
      callback({} as never, 0)));

    expect(mesh.position.x).toEqual(positionRef.current.x - 39);
    unmount();
    (useFrame as jest.Mock).mockReset();
  });

  it("updates a non-local Z carrier inside the render frame", () => {
    const frameCallbacks: Parameters<typeof useFrame>[0][] = [];
    (useFrame as jest.Mock).mockImplementation(
      (callback: Parameters<typeof useFrame>[0]) => {
        frameCallbacks.push(callback);
        return undefined;
      });
    const p = fakeProps();
    const positionRef = { current: { ...p.configPosition } };
    const { container, unmount } = render(<CableCarrierZ
      {...p}
      local={false}
      positionRef={positionRef} />);
    const mesh = container.querySelector("mesh") as unknown as {
      position: Vector3;
    };
    mesh.position = new Vector3();
    positionRef.current = {
      x: positionRef.current.x + 10,
      y: positionRef.current.y + 20,
      z: positionRef.current.z + 30,
    };

    act(() => frameCallbacks.forEach(callback =>
      callback({} as never, 0)));

    expect(mesh.position.toArray()).not.toEqual([0, 0, 0]);
    unmount();
    (useFrame as jest.Mock).mockReset();
  });

  it("updates an X carrier inside the render frame", () => {
    let frameCallback: Parameters<typeof useFrame>[0] | undefined;
    (useFrame as jest.Mock).mockImplementation(
      (callback: Parameters<typeof useFrame>[0]) => {
        frameCallback = callback;
        return undefined;
      });
    const p = fakeProps();
    const positionRef = { current: { ...p.configPosition } };
    const { container, unmount } = render(<CableCarrierX
      {...p}
      local={true}
      positionRef={positionRef} />);
    const mesh = container.querySelector("mesh") as unknown as {
      position: Vector3;
    };
    mesh.position = new Vector3();
    positionRef.current.x += 10;

    act(() => frameCallback?.({} as never, 0));

    expect(mesh.position.toArray()).not.toEqual([0, 0, 0]);
    unmount();
    (useFrame as jest.Mock).mockReset();
  });
});

describe("<CableCarrierVertical />", () => {
  const fakeProps = (): CableCarrierSupportVerticalProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it("renders v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<CableCarrierSupportVertical {...p} />);
    expect(container.innerHTML).toContain("ccSupportVertical");
    expect(container.querySelectorAll("instancedmesh").length).toBe(1);
    expect(useGltfMock).toHaveBeenCalledWith(
      ASSETS.models.ccSupportVertical, expect.anything());
  });

  it("renders v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container } = render(<CableCarrierSupportVertical {...p} />);
    expect(container.innerHTML).toContain("ccSupportVertical");
    expect(container.querySelectorAll("mesh").length).toBe(1);
    expect(useGltfMock).not.toHaveBeenCalledWith(
      ASSETS.models.ccSupportVertical, expect.anything());
  });

  it("skips disabled vertical support", () => {
    const p = fakeProps();
    p.config.cableCarriers = false;
    const moveToSpy = jest.spyOn(Shape.prototype, "moveTo");
    const { container } = render(<CableCarrierSupportVertical {...p} />);
    expect(container.querySelectorAll("mesh").length).toBe(0);
    expect(container.querySelectorAll("instancedmesh").length).toBe(0);
    expect(moveToSpy).not.toHaveBeenCalled();
    expect(useGltfMock).not.toHaveBeenCalled();
    moveToSpy.mockRestore();
  });

  it("updates v1.7 when a relevant axis changes", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const updateMatrixSpy = jest.spyOn(Object3D.prototype, "updateMatrix");
    const { rerender } = render(<CableCarrierSupportVertical {...p} />);
    const initialCalls = updateMatrixSpy.mock.calls.length;
    expect(initialCalls).toBeGreaterThan(0);
    rerender(<CableCarrierSupportVertical
      {...p}
      configPosition={{
        ...p.configPosition,
        z: p.configPosition.z + 10,
      }} />);
    expect(updateMatrixSpy.mock.calls.length).toBeGreaterThan(initialCalls);
    updateMatrixSpy.mockRestore();
  });
});

describe("<CableCarrierHorizontal />", () => {
  const fakeProps = (): CableCarrierSupportHorizontalProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it("renders v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<CableCarrierSupportHorizontal {...p} />);
    expect(container.innerHTML).toContain("ccSupportHorizontal");
    expect(container.querySelectorAll("instancedmesh").length).toBe(1);
    expect(useGltfMock).toHaveBeenCalledWith(
      ASSETS.models.ccSupportHorizontal, expect.anything());
  });

  it("renders v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container } = render(<CableCarrierSupportHorizontal {...p} />);
    expect(container.innerHTML).toContain("ccSupportHorizontal");
    expect(container.querySelectorAll("mesh").length).toBe(1);
    expect(useGltfMock).not.toHaveBeenCalledWith(
      ASSETS.models.ccSupportHorizontal, expect.anything());
  });

  it("renders v1.8: lights on", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    p.config.light = true;
    const { container } = render(<CableCarrierSupportHorizontal {...p} />);
    expect(container.innerHTML).toContain("ccSupportHorizontal");
    expect(container.querySelectorAll("mesh").length).toBe(1);
  });

  it("memoizes v1.7 by the x axis", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const updateMatrixSpy = jest.spyOn(Object3D.prototype, "updateMatrix");
    const { rerender } = render(<CableCarrierSupportHorizontal {...p} />);
    const initialCalls = updateMatrixSpy.mock.calls.length;
    expect(initialCalls).toBeGreaterThan(0);
    rerender(<CableCarrierSupportHorizontal
      {...p}
      configPosition={{
        ...p.configPosition,
        y: p.configPosition.y + 10,
      }} />);
    expect(updateMatrixSpy).toHaveBeenCalledTimes(initialCalls);
    rerender(<CableCarrierSupportHorizontal
      {...p}
      configPosition={{
        ...p.configPosition,
        x: p.configPosition.x + 10,
      }} />);
    expect(updateMatrixSpy.mock.calls.length).toBeGreaterThan(initialCalls);
    updateMatrixSpy.mockRestore();
  });

  it("memoizes v1.8 by geometry config fields", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const moveToSpy = jest.spyOn(Shape.prototype, "moveTo");
    const { rerender } = render(<CableCarrierSupportHorizontal {...p} />);
    expect(moveToSpy).toHaveBeenCalledTimes(1);
    rerender(<CableCarrierSupportHorizontal
      {...p}
      configPosition={{
        ...p.configPosition,
        y: p.configPosition.y + 10,
      }} />);
    expect(moveToSpy).toHaveBeenCalledTimes(1);
    rerender(<CableCarrierSupportHorizontal
      {...p}
      config={{
        ...p.config,
        botSizeY: p.config.botSizeY + 10,
      }} />);
    expect(moveToSpy).toHaveBeenCalledTimes(2);
    moveToSpy.mockRestore();
  });

  it("skips disabled horizontal support", () => {
    const p = fakeProps();
    p.config.cableCarriers = false;
    const moveToSpy = jest.spyOn(Shape.prototype, "moveTo");
    const { container } = render(<CableCarrierSupportHorizontal {...p} />);
    expect(container.querySelectorAll("mesh").length).toBe(0);
    expect(container.querySelectorAll("instancedmesh").length).toBe(0);
    expect(moveToSpy).not.toHaveBeenCalled();
    expect(useGltfMock).not.toHaveBeenCalled();
    moveToSpy.mockRestore();
  });
});
