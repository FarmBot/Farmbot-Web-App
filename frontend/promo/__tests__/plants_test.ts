import { clone, round } from "lodash";
import { calculatePlantPositions, getSizeAtTime, PLANTS } from "../plants";
import { INITIAL } from "../../three_d_garden/config";
import { CROPS } from "../../crops/constants";

describe("PLANTS", () => {
  it("returns data", () => {
    expect(PLANTS.anaheimPepper.size).toEqual(150);
  });
});

describe("calculatePlantPositions()", () => {
  it("calculates plant positions", () => {
    const config = clone(INITIAL);
    config.plants = "Spring";
    const positions = calculatePlantPositions(config);
    expect(positions).toContainEqual({
      icon: CROPS.beet.icon,
      key: "beet",
      label: "Beet",
      seed: expect.any(Number),
      size: 150,
      spread: 175,
      x: 350,
      y: 680,
    });
    expect(positions.length).toEqual(65);
  });

  it("returns no plants", () => {
    const config = clone(INITIAL);
    config.plants = "";
    const positions = calculatePlantPositions(config);
    expect(positions.length).toEqual(0);
  });
});

describe("getSizeAtTime()", () => {
  it("creates min report", () => {
    const plant = {
      icon: "", key: "foo", label: "Foo",
      seed: 0, size: 100, spread: 100, x: 0, y: 0,
    };
    console.table = jest.fn();
    expect(getSizeAtTime(plant, "Summer", 0, 0, true)).toEqual(0);
  });

  it("creates max report", () => {
    const plant = {
      icon: "", key: "foo", label: "Foo",
      seed: 1, size: 100, spread: 100, x: 0, y: 0,
    };
    console.table = jest.fn();
    expect(getSizeAtTime(plant, "Summer", 0, 1, true)).toEqual(0);
  });

  it.each<[number, number]>([
    [0, 0],
    [0.15, 0.02],
    [1, 0.15],
    [5, 0.75],
    [7, 1],
    [10, 1],
    [15, 1],
    [19, 0.25],
    [20, 0],
    [25, 0],
  ])("returns size: seed=0 t=%s sz=%s", (t, sz) => {
    const plant = {
      icon: "", key: "foo", label: "Foo",
      seed: 0, size: 100, spread: 100, x: 0, y: 0,
    };
    expect(round(getSizeAtTime(plant, "Summer", t), 2)).toEqual(sz);
  });

  it.each<[number, number]>([
    [0, 0],
    [0.15, 0],
    [1, 0],
    [5, 0.3],
    [7, 0.45],
    [10, 0.68],
    [15, 1],
    [19, 0.37],
    [20, 0],
    [25, 0],
  ])("returns size: seed=1 t=%s sz=%s", (t, sz) => {
    const plant = {
      icon: "", key: "foo", label: "Foo",
      seed: 1, size: 100, spread: 100, x: 0, y: 0,
    };
    expect(round(getSizeAtTime(plant, "Summer", t), 2)).toEqual(sz);
  });

  it("returns other size", () => {
    const plant = {
      icon: "", key: "beet", label: "Beet",
      seed: 0, size: 100, spread: 100, x: 0, y: 0,
    };
    const size = getSizeAtTime(plant, "Summer", 5);
    expect(size).not.toEqual(0);
    expect(size).not.toEqual(1);
  });
});
