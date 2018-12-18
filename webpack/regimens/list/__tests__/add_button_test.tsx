jest.unmock("../../actions");
jest.mock("../../../history", () => ({
  push: jest.fn(),
  history: {
    getCurrentLocation: () => "fake/path"
  }
}));
jest.mock("../../set_active_regimen_by_name", () => ({
  setActiveRegimenByName: jest.fn()
}));
import * as React from "react";
import { AddRegimen } from "../add_button";
import { AddRegimenProps } from "../../interfaces";
import { shallow } from "enzyme";
import { Actions } from "../../../constants";
import { push } from "../../../history";
import { setActiveRegimenByName } from "../../set_active_regimen_by_name";

describe("<AddRegimen/>", () => {
  function btn(props: AddRegimenProps) {
    return shallow(<AddRegimen {...props} />);
  }
  it("transfers class name", () => {
    expect(btn({
      className: "foo",
      dispatch: jest.fn(),
      length: 5
    }).hasClass("foo")).toBeTruthy();
  });

  it("dispatches a new regimen onclick", () => {
    const dispatch = jest.fn();
    const b = btn({ dispatch, length });
    expect(push).not.toHaveBeenCalled();
    b.find("button").simulate("click");
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.INIT_RESOURCE,
      payload: expect.objectContaining({
        kind: "Regimen"
      })
    });
    expect(push).toHaveBeenCalledWith("/app/regimens/new_regimen_0");
    expect(setActiveRegimenByName).toHaveBeenCalled();
  });

  it("uses props.children", () => {
    const b = btn({ dispatch: jest.fn(), length: 0, children: "child" });
    expect(b.text()).toContain("child");
    expect(b.find(".fa-plus").length).toEqual(0);
  });

  it("has default children", () => {
    const b = btn({ dispatch: jest.fn(), length: 0 });
    expect(b.find(".fa-plus").length).toEqual(1);
  });
});
