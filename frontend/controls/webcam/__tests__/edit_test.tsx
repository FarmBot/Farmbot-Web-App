import * as React from "react";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { mount, shallow } from "enzyme";
import { props } from "../test_helpers";
import { Edit } from "../edit";
import { SpecialStatus } from "farmbot";
import { clickButton } from "../../../__test_support__/helpers";
import { WebcamPanelProps } from "../interfaces";
import { KeyValEditRow } from "../../key_val_edit_row";

describe("<Edit/>", () => {
  const fakeProps = (): WebcamPanelProps => {
    const feed1 = fakeWebcamFeed();
    const feed2 = fakeWebcamFeed();
    feed1.specialStatus = SpecialStatus.DIRTY;
    return props([feed1, feed2]);
  };

  it("renders the list of feeds", () => {
    const p = fakeProps();
    const wrapper = mount(<Edit {...p} />);
    [
      p.feeds[0].body.name,
      p.feeds[0].body.url,
      p.feeds[1].body.name,
      p.feeds[1].body.url
    ].map(text =>
      expect(wrapper.html()).toContain(text));
  });

  it("saves feeds", () => {
    const p = fakeProps();
    const wrapper = mount(<Edit {...p} />);
    clickButton(wrapper, 1, "save*");
    expect(p.save).toHaveBeenCalledWith(p.feeds[0]);
  });

  it("shows feeds as saved", () => {
    const p = fakeProps();
    p.feeds[0].specialStatus = SpecialStatus.SAVED;
    p.feeds[1].specialStatus = SpecialStatus.SAVED;
    const wrapper = mount(<Edit {...p} />);
    expect(wrapper.find("button").at(1).text()).toEqual("Save");
  });

  it("deletes feed", () => {
    const p = fakeProps();
    const wrapper = shallow(<Edit {...p} />);
    wrapper.find("WidgetBody").find("KeyValEditRow").first().simulate("click");
    expect(p.destroy).toHaveBeenCalledWith(p.feeds[0]);
  });

  it("changes name", () => {
    const p = fakeProps();
    const wrapper = shallow(<Edit {...p} />);
    wrapper.find(KeyValEditRow).first().simulate("labelChange", {
      currentTarget: { value: "new_name" }
    });
    expect(p.edit).toHaveBeenCalledWith(p.feeds[0], { name: "new_name" });
  });

  it("changes url", () => {
    const p = fakeProps();
    const wrapper = shallow(<Edit {...p} />);
    wrapper.find(KeyValEditRow).first().simulate("valueChange", {
      currentTarget: { value: "new_url" }
    });
    expect(p.edit).toHaveBeenCalledWith(p.feeds[0], { url: "new_url" });
  });
});
