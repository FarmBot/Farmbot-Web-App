let mockLastUrlChunk = "farmware";

jest.mock("../../util/urls", () => {
  return {
    urlFriendly: jest.fn(x => x),
    lastUrlChunk: jest.fn(() => mockLastUrlChunk)
  };
});

jest.mock("../../redux/store", () => ({
  store: { dispatch: jest.fn() }
}));

import { setActiveFarmwareByName } from "../set_active_farmware_by_name";
import { store } from "../../redux/store";
import { Actions } from "../../constants";

describe("setActiveFarmwareByName", () => {
  it("returns early if there is nothing to compare", () => {
    mockLastUrlChunk = "farmware";
    setActiveFarmwareByName([]);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("sometimes can't find a farmware by name", () => {
    mockLastUrlChunk = "non_farmware";
    setActiveFarmwareByName([]);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("finds a farmware by name", () => {
    mockLastUrlChunk = "my_farmware";
    setActiveFarmwareByName(["my_farmware"]);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_FARMWARE,
      payload: "my_farmware"
    });
  });

  it("finds a farmware by name: other match", () => {
    mockLastUrlChunk = "weed_detector";
    setActiveFarmwareByName(["plant_detection"]);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_FARMWARE,
      payload: "plant_detection"
    });
  });

  it("handles undefined farmware names", () => {
    mockLastUrlChunk = "some_farmware";
    setActiveFarmwareByName([undefined]);
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
