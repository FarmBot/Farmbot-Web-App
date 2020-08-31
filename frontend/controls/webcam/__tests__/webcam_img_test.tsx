import React from "react";
import { WebcamImg } from "../webcam_img";
import { mount } from "enzyme";
import { WebcamImgProps } from "../interfaces";
import { PLACEHOLDER_FARMBOT } from "../../../photos/images/image_flipper";

describe("<WebcamImg />", () => {
  const fakeProps = (): WebcamImgProps => ({
    src: "url",
  });

  it("renders img", () => {
    const wrapper = mount<WebcamImg>(<WebcamImg {...fakeProps()} />);
    wrapper.setState({ isLoaded: false });
    wrapper.instance().onLoad();
    expect(wrapper.state().isLoaded).toBeTruthy();
    wrapper.update();
    const content = wrapper.find("img");
    expect(content.length).toEqual(1);
    expect(content.props().src).toEqual("url");
  });

  it("renders iframe", () => {
    const p = fakeProps();
    p.src = "iframe url";
    const wrapper = mount(<WebcamImg {...p} />);
    const content = wrapper.find("iframe");
    expect(content.length).toEqual(1);
    expect(content.props().src).toEqual("url");
  });

  it("falls back", () => {
    const wrapper = mount<WebcamImg>(<WebcamImg {...fakeProps()} />);
    wrapper.setState({ needsFallback: false });
    wrapper.instance().onError();
    expect(wrapper.state().needsFallback).toBeTruthy();
    wrapper.update();
    const content = wrapper.find("img");
    expect(content.length).toEqual(1);
    expect(content.props().src).toEqual(PLACEHOLDER_FARMBOT);
  });
});
