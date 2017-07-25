jest.unmock("../../actions");
let mockPush = jest.fn();
jest.mock("../../../history", () => ({ push: mockPush }));
import * as React from "react";
import { AddRegimen } from "../add_button";
import { AddRegimenProps } from "../../interfaces";
import { shallow } from "enzyme";

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
    let dispatch = jest.fn();
    let b = btn({ dispatch, length });
    expect(mockPush.mock.calls.length).toBe(0);
    b.find("button").simulate("click");
    expect(dispatch.mock.calls.length).toEqual(1);
    let action = dispatch.mock.calls[0][0];
    expect(action.type).toEqual("INIT_RESOURCE");
    expect(action.payload).toBeTruthy();
    expect(action.payload.kind).toEqual("regimens");
  });

  it("has children (or defaults)");
});
