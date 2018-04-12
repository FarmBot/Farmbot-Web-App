import {
  round,
  translateScreenToGarden,
  getBotSize,
  getMapSize,
  getXYFromQuadrant,
  transformForQuadrant
} from "../util";
import { McuParams } from "farmbot";
import { AxisNumberProperty, BotSize } from "../interfaces";
import { StepsPerMmXY } from "../../../devices/interfaces";

describe("Utils", () => {
  it("rounds a number", () => {
    expect(round(44)).toEqual(40);
    expect(round(98)).toEqual(100);
  });
});

describe("translateScreenToGarden()", () => {
  it("translates garden coords to screen coords: corner case", () => {
    const cornerCase = translateScreenToGarden({
      quadrant: 2,
      pageX: 520,
      pageY: 212,
      zoomLvl: 1,
      gridSize: { x: 3000, y: 1500 }
    });
    expect(cornerCase.x).toEqual(200);
    expect(cornerCase.y).toEqual(100);
  });

  it("translates garden coords to screen coords: edge case", () => {
    const edgeCase = translateScreenToGarden({
      quadrant: 2,
      pageX: 1132,
      pageY: 382,
      zoomLvl: 0.3,
      gridSize: { x: 3000, y: 1500 }
    });

    expect(Math.round(edgeCase.x)).toEqual(2710);
    expect(Math.round(edgeCase.y)).toEqual(910);
  });
});

describe("getbotSize()", () => {
  function fakeProps() {
    const botMcuParams: McuParams = {
      movement_stop_at_max_x: undefined,
      movement_stop_at_max_y: undefined,
      movement_axis_nr_steps_x: undefined,
      movement_axis_nr_steps_y: undefined
    };
    const stepsPerMmXY: StepsPerMmXY = { x: undefined, y: undefined };
    const defaultLength: AxisNumberProperty = { x: 3000, y: 1500 };
    return {
      botMcuParams,
      stepsPerMmXY,
      defaultLength
    };
  }

  function expectDefaultSize(botSize: BotSize) {
    expect(botSize).toEqual({
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true }
    });
  }

  it("returns default bed size: when settings undefined", () => {
    const p = fakeProps();
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when stop at max disabled", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 0,
      movement_stop_at_max_y: 0,
      movement_axis_nr_steps_x: 100,
      movement_axis_nr_steps_y: 100
    };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when axis length is default", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 0,
      movement_axis_nr_steps_y: 0
    };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("returns default bed size: when steps per mm is 0", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 100,
      movement_axis_nr_steps_y: 100
    };
    p.stepsPerMmXY = { x: 0, y: 0 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expectDefaultSize(botSize);
  });

  it("calculates correct bed size: both axes", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 1,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 500,
      movement_axis_nr_steps_y: 1400
    };
    p.stepsPerMmXY = { x: 5, y: 7 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expect(botSize).toEqual({
      x: { value: 100, isDefault: false },
      y: { value: 200, isDefault: false }
    });
  });

  it("calculates correct bed size: one axis", () => {
    const p = fakeProps();
    p.botMcuParams = {
      movement_stop_at_max_x: 0,
      movement_stop_at_max_y: 1,
      movement_axis_nr_steps_x: 500,
      movement_axis_nr_steps_y: 1400
    };
    p.stepsPerMmXY = { x: 5, y: 7 };
    const botSize = getBotSize(p.botMcuParams, p.stepsPerMmXY, p.defaultLength);
    expect(botSize).toEqual({
      x: { value: 3000, isDefault: true },
      y: { value: 200, isDefault: false }
    });
  });
});

describe("getMapSize()", () => {
  it("calculates map size", () => {
    const mapSize = getMapSize(
      { x: 2000, y: 1000 },
      { x: 100, y: 50 });
    expect(mapSize).toEqual({ x: 2200, y: 1100 });
  });
});

describe("getXYFromQuadrant()", () => {
  it("calculates transformed coordinate: quadrant 2", () => {
    const { qx, qy } = getXYFromQuadrant(100, 200, 2, { x: 2000, y: 1000 });
    expect(qx).toEqual(100);
    expect(qy).toEqual(200);
  });

  it("calculates transformed coordinate: quadrant 4", () => {
    const { qx, qy } = getXYFromQuadrant(100, 200, 4, { x: 2000, y: 1000 });
    expect(qx).toEqual(1900);
    expect(qy).toEqual(800);
  });

  it("calculates transformed coordinate: quadrant 4 (outside of grid)", () => {
    const { qx, qy } = getXYFromQuadrant(2200, 1100, 4, { x: 2000, y: 1000 });
    expect(qx).toEqual(-200);
    expect(qy).toEqual(-100);
  });
});

describe("transformForQuadrant()", () => {
  it("calculates transform for quadrant 1", () => {
    expect(transformForQuadrant(1, { x: 200, y: 100 }))
      .toEqual("scale(-1, 1) translate(-200, 0)");
  });

  it("calculates transform for quadrant 2", () => {
    expect(transformForQuadrant(2, { x: 200, y: 100 }))
      .toEqual("scale(1, 1) translate(0, 0)");
  });

  it("calculates transform for quadrant 3", () => {
    expect(transformForQuadrant(3, { x: 200, y: 100 }))
      .toEqual("scale(1, -1) translate(0, -100)");
  });

  it("calculates transform for quadrant 4", () => {
    expect(transformForQuadrant(4, { x: 200, y: 100 }))
      .toEqual("scale(-1, -1) translate(-200, -100)");
  });
});
