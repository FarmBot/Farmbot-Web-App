jest.mock("../../api/crud", () => ({
  edit: jest.fn()
}));

import { movePlant } from "../actions";
import { MovePlantProps } from "../interfaces";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { edit } from "../../api/crud";

describe("movePlant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates plant", () => {
    const payload: MovePlantProps = {
      deltaX: 1,
      deltaY: 2,
      plant: fakePlant(),
      gridSize: { x: 3000, y: 1500 }
    };
    const { mock } = edit as jest.Mock<{}>;
    movePlant(payload);
    const oldPlant = mock.calls[0][0];
    expect(oldPlant.body.x).toBe(100);
    expect(oldPlant.body.y).toBe(200);
    const update = mock.calls[0][1];
    expect(update.x).toBe(101);
    expect(update.y).toBe(202);
  });

  it("restricts plant to grid area: high", () => {
    const payload: MovePlantProps = {
      deltaX: 10000,
      deltaY: 10000,
      plant: fakePlant(),
      gridSize: { x: 3000, y: 1500 }
    };
    const { mock } = edit as jest.Mock<{}>;
    movePlant(payload);
    const oldPlant = mock.calls[0][0];
    expect(oldPlant.body.x).toBe(100);
    expect(oldPlant.body.y).toBe(200);
    const update = mock.calls[0][1];
    expect(update.x).toBe(3000);
    expect(update.y).toBe(1500);
  });

  it("restricts plant to grid area: low", () => {
    const payload: MovePlantProps = {
      deltaX: -10000,
      deltaY: -10000,
      plant: fakePlant(),
      gridSize: { x: 3000, y: 1500 }
    };
    const { mock } = edit as jest.Mock<{}>;
    movePlant(payload);
    const oldPlant = mock.calls[0][0];
    expect(oldPlant.body.x).toBe(100);
    expect(oldPlant.body.y).toBe(200);
    const update = mock.calls[0][1];
    expect(update.x).toBe(0);
    expect(update.y).toBe(0);
  });
});
