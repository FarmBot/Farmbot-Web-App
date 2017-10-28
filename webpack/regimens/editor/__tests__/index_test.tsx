import { fakeState } from "../../../__test_support__/fake_state";
const mockState = fakeState;
const mockDestroy = jest.fn();
const mockSave = jest.fn();
jest.mock("../../../api/crud", () => ({
  getState: mockState,
  destroy: mockDestroy,
  save: mockSave
}));

import * as React from "react";
import { mount } from "enzyme";
import { RegimenEditorWidget } from "../index";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { RegimenEditorWidgetProps } from "../interfaces";
import { auth } from "../../../__test_support__/fake_state/token";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<RegimenEditorWidget />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  function fakeProps(): RegimenEditorWidgetProps {
    return {
      dispatch: jest.fn(),
      auth,
      bot,
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
    const wrapper = mount(<RegimenEditorWidget {...fakeProps() } />);
    ["Regimen Editor", "Delete", "Item 0", "10:00"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("empty editor", () => {
    const props = fakeProps();
    props.current = undefined;
    const wrapper = mount(<RegimenEditorWidget {...props} />);
    ["Regimen Editor", "No Regimen selected."].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("error: not logged in", () => {
    const props = fakeProps();
    props.auth = undefined;
    const wrapper = () => mount(<RegimenEditorWidget {...props} />);
    expect(wrapper).toThrowError("Must log in first");
  });

  it("deletes regimen", () => {
    const wrapper = mount(<RegimenEditorWidget {...fakeProps() } />);
    const deleteButton = wrapper.find("button").at(2);
    expect(deleteButton.text()).toContain("Delete");
    deleteButton.simulate("click");
    expect(mockDestroy).toHaveBeenCalledWith("Regimen.6.22");
  });

  it("saves regimen", () => {
    const wrapper = mount(<RegimenEditorWidget {...fakeProps() } />);
    const saveeButton = wrapper.find("button").at(0);
    expect(saveeButton.text()).toContain("Save");
    saveeButton.simulate("click");
    expect(mockSave).toHaveBeenCalledWith("Regimen.8.24");
  });
});
