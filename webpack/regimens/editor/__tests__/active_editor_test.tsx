import * as React from "react";
import { mount } from "enzyme";
import { ActiveEditor } from "../active_editor";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { ActiveEditorProps } from "../interfaces";
import { Actions } from "../../../constants";
import { SpecialStatus } from "../../../resources/tagged_resources";

describe("<ActiveEditor />", () => {
  const props: ActiveEditorProps = {
    dispatch: jest.fn(),
    regimen: fakeRegimen(),
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

  it("renders", () => {
    const wrapper = mount<{}>(<ActiveEditor {...props} />);
    ["Day", "Item 0", "10:00"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("removes regimen item", () => {
    const wrapper = mount<{}>(<ActiveEditor {...props} />);
    wrapper.find("i").simulate("click");
    expect(props.dispatch).toHaveBeenCalledWith({
      payload: {
        update: expect.objectContaining({ regimen_items: [] }),
        uuid: expect.stringContaining("Regimen"),
        specialStatus: SpecialStatus.DIRTY
      },
      type: Actions.OVERWRITE_RESOURCE
    });
  });
});
