import * as React from "react";
import { mount } from "enzyme";
import { Folders } from "../component";
import { FolderProps } from "../constants";

describe("<Folders />", () => {
  const fakeProps = (): FolderProps => ({
    rootFolder: {
      folders: [],
      noFolder: [],
    },
    sequences: {},
    searchTerm: undefined,
    dispatch: Function,
    resourceUsage: {},
    sequenceMetas: {},
  });

  it("renders empty state", () => {
    const p = fakeProps();
    const wrapper = mount<Folders>(<Folders {...p} />);
    expect(wrapper.text()).toContain("No Sequences.");
  });
});
