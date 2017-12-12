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

  function movePlantTest(
    caseDescription: string,
    attempted: { x: number, y: number },
    expected: { x: number, y: number }) {
    it(`restricts plant to grid area: ${caseDescription}`, () => {
      const payload: MovePlantProps = {
        deltaX: attempted.x,
        deltaY: attempted.y,
        plant: fakePlant(),
        gridSize: { x: 3000, y: 1500 }
      };
      movePlant(payload);
      const [argList] = (edit as jest.Mock<{}>).mock.calls;
      const oldPlant = argList[0];
      expect(oldPlant.body.x).toBe(100);
      expect(oldPlant.body.y).toBe(200);
      const update = argList[1];
      expect(update.x).toBe(expected.x);
      expect(update.y).toBe(expected.y);
    });
  }
  movePlantTest("within bounds", { x: 1, y: 2 }, { x: 101, y: 202 });
  movePlantTest("too high", { x: 10000, y: 10000 }, { x: 3000, y: 1500 });
  movePlantTest("too low", { x: -10000, y: -10000 }, { x: 0, y: 0 });
});
