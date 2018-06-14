import { fakeState } from "../../../__test_support__/fake_state";
const mockState = fakeState;
jest.mock("../../../api/crud", () => ({
  getState: mockState,
  destroy: jest.fn(),
  save: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { RegimenEditor } from "../index";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { RegimenEditorProps } from "../interfaces";
import { destroy, save } from "../../../api/crud";

describe("<RegimenEditor />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): RegimenEditorProps {
    return {
      dispatch: jest.fn(),
      current: fakeRegimen(),
      calendar: [{
        day: "1",
        items: [{
          name: "Item 0",
          color: "red",
          hhmm: "10:00",
          sortKey: 0,
          day: 1,
          dispatch: jest.fn(),
          regimen: fakeRegimen(),
          item: {
            sequence_id: 0, time_offset: 1000
          }
        }]
      }]
    };
  }

  it("active editor", () => {
    const wrapper = mount(<RegimenEditor {...fakeProps()} />);
    ["Delete", "Item 0", "10:00"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("empty editor", () => {
    const props = fakeProps();
    props.current = undefined;
    const wrapper = mount(<RegimenEditor {...props} />);
    ["No Regimen selected."].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("deletes regimen", () => {
    const p = fakeProps();
    const wrapper = mount(<RegimenEditor {...p} />);
    const deleteButton = wrapper.find("button").at(2);
    expect(deleteButton.text()).toContain("Delete");
    deleteButton.simulate("click");
    const expectedUuid = p.current && p.current.uuid;
    expect(destroy).toHaveBeenCalledWith(expectedUuid);
  });

  it("saves regimen", () => {
    const p = fakeProps();
    const wrapper = mount(<RegimenEditor {...p} />);
    const saveeButton = wrapper.find("button").at(0);
    expect(saveeButton.text()).toContain("Save");
    saveeButton.simulate("click");
    const expectedUuid = p.current && p.current.uuid;
    expect(save).toHaveBeenCalledWith(expectedUuid);
  });
});
