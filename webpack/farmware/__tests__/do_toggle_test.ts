jest.mock("../../config_storage/actions", () => {
  return {
    toggleWebAppBool: jest.fn(() => "IT WORKS")
  };
});

import { doToggle } from "../index";
import { toggleWebAppBool } from "../../config_storage/actions";

describe("doToggle()", () => {
  it("calls toggleWebAppBool, but isolated from its parent", () => {
    const dispatch = jest.fn();
    const toggler = doToggle(dispatch);
    const key = "show_first_party_farmware";
    toggler(key);
    expect(toggleWebAppBool).toHaveBeenCalledWith(key);
    expect(dispatch).toHaveBeenCalledWith("IT WORKS");
  });
});
