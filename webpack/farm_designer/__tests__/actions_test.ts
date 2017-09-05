jest.mock("../../api/crud", () => ({
  edit: jest.fn()
}));

import { movePlant } from "../actions";
import { MovePlantProps } from "../interfaces";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { edit } from "../../api/crud";

describe("movePlant", () => {
  it("updates plant", () => {
    const payload: MovePlantProps = {
      deltaX: 1,
      deltaY: 2,
      plant: fakePlant()
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
});
