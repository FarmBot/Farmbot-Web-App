import React from "react";
import { act, render } from "@testing-library/react";
import * as threeFiber from "@react-three/fiber";
import { BufferAttribute, Texture, TextureLoader } from "three";
import { mergedTubeParts } from "../../../tube_silhouette";
import { WaterSprayGeometry } from "../water_spray_geometry";
import {
  WateringAnimations, wateringAnimationsPropsEqual,
  WateringAnimationsProps,
} from "../watering_animations";

describe("<WateringAnimations />", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  const fakeProps = (): WateringAnimationsProps => ({
    waterFlow: true,
    nozzlePosition: [10, 20, 200],
    nozzleToSoil: -200,
    nozzleRadius: 9,
  });

  it("renders", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    const { container } = render(<WateringAnimations {...p} />);
    act(() => { jest.advanceTimersByTime(60); });
    const spray = container.querySelectorAll("[name='water-spray']");
    expect(spray).toHaveLength(1);
    const mist = container.querySelector("[name='water-mist']");
    expect(mist).toHaveAttribute("limit", "55");
    expect(mist?.querySelector("[name='waterfall-mist-cloud']")).toBeTruthy();
    expect(mist?.querySelector("[name='water-spot-mist-cloud']")).toBeTruthy();
  });

  it("shares one animated texture across water streams", () => {
    jest.useFakeTimers();
    const loadTextureSpy = jest.spyOn(TextureLoader.prototype, "load")
      .mockImplementation(() => new Texture());
    const useFrameSpy = jest.spyOn(threeFiber, "useFrame")
      .mockImplementation(() => undefined as never);
    const p = fakeProps();
    const { container } = render(<WateringAnimations {...p} />);
    act(() => { jest.advanceTimersByTime(60); });
    expect(container.querySelectorAll("[name='water-spray']")).toHaveLength(1);
    expect(loadTextureSpy).toHaveBeenCalledTimes(1);
    expect(useFrameSpy.mock.calls.length).toBeLessThan(16);
    loadTextureSpy.mockRestore();
    useFrameSpy.mockRestore();
  });

  it("updates when the nozzle moves or the soil distance changes", () => {
    const previous = fakeProps();
    expect(wateringAnimationsPropsEqual(previous, fakeProps())).toBeTruthy();
    expect(wateringAnimationsPropsEqual(previous, {
      ...previous, nozzlePosition: [10, 20, 201],
    })).toBeFalsy();
    expect(wateringAnimationsPropsEqual(previous, {
      ...previous, nozzleToSoil: -201,
    })).toBeFalsy();
    expect(wateringAnimationsPropsEqual(previous, {
      ...previous, nozzleRadius: 12.5,
    })).toBeFalsy();
    expect(wateringAnimationsPropsEqual(previous, {
      ...previous, waterFlow: false,
    })).toBeFalsy();
  });
});

describe("WaterSprayGeometry", () => {
  it("batches all 16 curved jets and retains their silhouette sources", () => {
    const spray = new WaterSprayGeometry(9, -200);
    const parts = mergedTubeParts.get(spray);
    const jets = parts?.tubes;
    expect(parts?.solidVertexCount).toEqual(0);
    expect(jets).toHaveLength(16);
    expect(spray.getAttribute("position").count).toEqual(16 * 9 * 7);
    expect(spray.getIndex()?.count).toEqual(16 * 8 * 6 * 6);
    expect(jets?.[0].parameters.path.getPoint(0).toArray()).toEqual([0, 9, 0]);
    expect(jets?.[0].parameters.path.getPoint(1).toArray())
      .toEqual([0, 25, -200]);
    for (const attribute of ["position", "normal", "uv"]) {
      expect(spray.getAttribute(attribute).array.slice(0,
        jets?.[0].getAttribute(attribute).array.length))
        .toEqual(jets?.[0].getAttribute(attribute).array);
    }
    spray.dispose();
  });

  it("deforms the surface and outlines together in reusable buffers", () => {
    const spray = new WaterSprayGeometry(9, -200);
    const position = spray.getAttribute("position") as BufferAttribute;
    const normal = spray.getAttribute("normal") as BufferAttribute;
    const index = spray.getIndex();
    const jets = mergedTubeParts.get(spray)?.tubes;

    spray.update(9, -200);
    expect(position.version).toEqual(0);
    spray.update(12.5, -305);
    expect(spray.getAttribute("position")).toBe(position);
    expect(spray.getAttribute("normal")).toBe(normal);
    expect(spray.getIndex()).toBe(index);
    expect(position.version).toEqual(1);
    expect(normal.version).toEqual(1);
    expect(jets?.[0].parameters.path.getPoint(0).toArray())
      .toEqual([0, 12.5, 0]);
    expect(jets?.[0].parameters.path.getPoint(1).toArray())
      .toEqual([0, 25, -305]);
    const jetPositions = jets?.[0].getAttribute("position").array;
    expect(position.array.slice(0, jetPositions?.length)).toEqual(jetPositions);
    expect(spray.boundingSphere?.radius).toBeGreaterThan(150);
    spray.dispose();
  });
});
