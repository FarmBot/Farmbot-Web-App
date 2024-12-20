jest.mock("../../redux/store", () => ({ store: { dispatch: jest.fn() } }));

import { setActiveFarmwareByName } from "../set_active_farmware_by_name";
import { store } from "../../redux/store";
import { Actions } from "../../constants";
import { Path } from "../../internal_urls";

describe("setActiveFarmwareByName()", () => {
  it("returns early if there is nothing to compare", () => {
    location.pathname = Path.mock(Path.farmware());
    setActiveFarmwareByName([]);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("sometimes can't find a farmware by name", () => {
    location.pathname = Path.mock(Path.farmware("non_farmware"));
    setActiveFarmwareByName([]);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it("finds a farmware by name", () => {
    location.pathname = Path.mock(Path.farmware("my_farmware"));
    setActiveFarmwareByName(["my_farmware"]);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_FARMWARE,
      payload: "my_farmware"
    });
  });

  it("finds a farmware by name: other match", () => {
    location.pathname = Path.mock(Path.farmware("weed_detector"));
    setActiveFarmwareByName(["plant_detection"]);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_FARMWARE,
      payload: "plant_detection"
    });
  });

  it("handles undefined farmware names", () => {
    location.pathname = Path.mock(Path.farmware("some_farmware"));
    setActiveFarmwareByName([undefined]);
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
