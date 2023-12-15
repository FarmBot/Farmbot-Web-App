jest.mock("../delete_points", () => ({
  deletePointsByIds: jest.fn(),
}));

import { deleteAllIds } from "../delete_points_handler";
import { deletePointsByIds } from "../delete_points";
import { fakePoint } from "../../__test_support__/fake_state/resources";

describe("deleteAllIds()", () => {
  it("deletes points", () => {
    window.confirm = () => true;
    const points = [fakePoint(), fakePoint()];
    deleteAllIds("points", points)(
      { stopPropagation: jest.fn() } as unknown as React.MouseEvent<HTMLElement>);
    expect(deletePointsByIds).toHaveBeenCalledWith("points", [1, 2]);
  });

  it("doesn't delete points", () => {
    window.confirm = () => false;
    const points = [fakePoint(), fakePoint()];
    deleteAllIds("points", points)(
      { stopPropagation: jest.fn() } as unknown as React.MouseEvent<HTMLElement>);
    expect(deletePointsByIds).not.toHaveBeenCalled();
  });
});
