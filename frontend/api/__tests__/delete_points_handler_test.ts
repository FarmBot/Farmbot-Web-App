import { deleteAllIds } from "../delete_points_handler";
import * as deletePoints from "../delete_points";
import { fakePoint } from "../../__test_support__/fake_state/resources";

describe("deleteAllIds()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(deletePoints, "deletePointsByIds")
      .mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deletes points", () => {
    window.confirm = () => true;
    const points = [fakePoint(), fakePoint()];
    points[0].body.id = 1;
    points[1].body.id = 2;
    deleteAllIds("points", points)(
      { stopPropagation: jest.fn() } as unknown as React.MouseEvent<HTMLElement>);
    expect(deletePoints.deletePointsByIds).toHaveBeenCalledWith("points", [1, 2]);
  });

  it("doesn't delete points", () => {
    window.confirm = () => false;
    const points = [fakePoint(), fakePoint()];
    deleteAllIds("points", points)(
      { stopPropagation: jest.fn() } as unknown as React.MouseEvent<HTMLElement>);
    expect(deletePoints.deletePointsByIds).not.toHaveBeenCalled();
  });
});
