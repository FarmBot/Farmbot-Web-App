import React from "react";
import { mount } from "enzyme";
import {
  DocumentationPanel,
  DocumentationPanelProps,
} from "../documentation";

describe("<DocumentationPanel />", () => {
  const fakeProps = (): DocumentationPanelProps => ({
    url: "fake url",
  });

  it("renders iframe", () => {
    const wrapper = mount(<DocumentationPanel {...fakeProps()} />);
    expect(wrapper.find("iframe").props().src)
      .toEqual("fake url");
  });
});
