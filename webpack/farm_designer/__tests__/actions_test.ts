const mockHistory = jest.fn();
let mockPath = "/app/designer/plants";
jest.mock("../../history", () => ({
  history: {
    push: mockHistory
  },
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

jest.mock("../../api/crud", () => ({
  edit: jest.fn()
}));

import { movePlant, closePlantInfo } from "../actions";
import { MovePlantProps } from "../interfaces";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { edit } from "../../api/crud";
import { Actions } from "../../constants";

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
      expect(edit).toHaveBeenCalledWith(
        // Old plant
        expect.objectContaining({
          body: expect.objectContaining({
            x: 100, y: 200
          })
        }),
        // Update
        expect.objectContaining({
          x: expected.x, y: expected.y
        })
      );
    });
  }
  movePlantTest("within bounds", { x: 1, y: 2 }, { x: 101, y: 202 });
  movePlantTest("too high", { x: 10000, y: 10000 }, { x: 3000, y: 1500 });
  movePlantTest("too low", { x: -10000, y: -10000 }, { x: 0, y: 0 });
});

describe("closePlantInfo()", () => {
  it("no plant info open", () => {
    mockPath = "/app/designer/plants";
    const dispatch = jest.fn();
    closePlantInfo(dispatch)();
    expect(mockHistory).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("plant edit open", () => {
    mockPath = "/app/designer/plants/1/edit";
    const dispatch = jest.fn();
    closePlantInfo(dispatch)();
    expect(mockHistory).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("plant info open", () => {
    mockPath = "/app/designer/plants/1";
    const dispatch = jest.fn();
    closePlantInfo(dispatch)();
    expect(mockHistory).toHaveBeenCalledWith("/app/designer/plants");
    expect(dispatch).toHaveBeenCalledWith({
      payload: undefined, type: Actions.SELECT_PLANT
    });
  });
});
