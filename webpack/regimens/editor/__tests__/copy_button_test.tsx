jest.mock("../../../history", () => ({ push: jest.fn() }));

jest.unmock("../../../api/crud");
import * as React from "react";
import { mount } from "enzyme";
import { CopyButton } from "../copy_button";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { SpecialStatus } from "../../../resources/tagged_resources";
import { Actions } from "../../../constants";
import { push } from "../../../history";

describe("Copy button", () => {

  it("Initializes a new regimen on click", () => {
    const dispatch = jest.fn();
    const regimen = fakeRegimen();
    const el =mount<>(<CopyButton dispatch={dispatch} regimen={regimen} />);
    expect(el.find("button").length).toBe(1);
    el.simulate("click");
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        body: expect.objectContaining({
          name: expect.stringContaining("Foo copy")
        }),
        specialStatus: SpecialStatus.DIRTY,
        kind: "Regimen"
      }),
      type: Actions.INIT_RESOURCE
    });
    expect(push).toHaveBeenCalledWith("/app/regimens/foo_copy_1");
  });

  it("Render a button when given a regimen", () => {
    const dispatch = jest.fn();
    const regimen = fakeRegimen();
    const el =mount<>(<CopyButton dispatch={dispatch} regimen={regimen} />);
    expect(el.find("button").length).toBe(1);
    el.simulate("click");
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("renders nothing if not given a regimen", () => {
    const dispatch = jest.fn();
    const el =mount<>(<CopyButton dispatch={dispatch} />);
    expect(el.find("button").length).toBe(0);
    el.simulate("click");
    expect(dispatch).not.toHaveBeenCalled();
  });

});
