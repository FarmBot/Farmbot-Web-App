import * as React from "react";
import { FallbackImg } from "../fallback_img";
import { mount } from "enzyme";

describe("<FallbackImg />", () => {
  function fakeProps() {
    return {
      src: "url",
      fallback: "fallback"
    };
  }
  it("renders img", () => {
    const wrapper = mount(<FallbackImg {...fakeProps()} />);
    const content = wrapper.find("img");
    expect(content.length).toEqual(1);
    expect(content.props().src).toEqual("url");
  });

  it("renders iframe", () => {
    const p = fakeProps();
    p.src = "iframe url";
    const wrapper = mount(<FallbackImg {...p} />);
    const content = wrapper.find("iframe");
    expect(content.length).toEqual(1);
    expect(content.props().src).toEqual("url");
  });

  it("falls back", () => {
    const wrapper = mount(<FallbackImg {...fakeProps()} />);
    wrapper.setState({ needsFallback: true });
    const content = wrapper.find("img");
    expect(content.length).toEqual(1);
    expect(content.props().src).toEqual("fallback");
  });
});
