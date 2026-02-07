import React from "react";
import { mount } from "enzyme";
import { CopyButton } from "../copy_button";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import * as setActiveRegimenByNameModule from "../../set_active_regimen_by_name";
import * as crud from "../../../api/crud";
import { CopyButtonProps } from "../interfaces";
import { Path } from "../../../internal_urls";

let initSpy: jest.SpyInstance;
let setActiveRegimenByNameSpy: jest.SpyInstance;

beforeEach(() => {
  initSpy = jest.spyOn(crud, "init").mockImplementation(jest.fn());
  setActiveRegimenByNameSpy = jest.spyOn(
    setActiveRegimenByNameModule,
    "setActiveRegimenByName",
  ).mockImplementation(jest.fn());
});

afterEach(() => {
  initSpy.mockRestore();
  setActiveRegimenByNameSpy.mockRestore();
});

describe("<CopyButton />", () => {
  const fakeProps = (): CopyButtonProps => ({
    dispatch: jest.fn(x => x(jest.fn())),
    regimen: fakeRegimen(),
  });

  it("initializes a new regimen on click", () => {
    const p = fakeProps();
    p.regimen.body.regimen_items = [{
      regimen_id: 1, sequence_id: 1, time_offset: 1
    }];
    const { regimen_items } = p.regimen.body;
    const wrapper = mount(<CopyButton {...p} />);
    wrapper.simulate("click");
    expect(p.dispatch).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalledWith("Regimen", {
      color: "red", name: "Foo copy 1", regimen_items, body: []
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.regimens("Foo_copy_1"));
    expect(setActiveRegimenByNameSpy).toHaveBeenCalled();
  });
});
