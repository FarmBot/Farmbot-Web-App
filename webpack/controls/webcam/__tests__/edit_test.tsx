import * as React from "react";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { shallow } from "enzyme";
import { props } from "../test_helpers";
import { Edit } from "../edit";
import { get } from "lodash";
import { SpecialStatus } from "../../../resources/tagged_resources";

describe("<Edit/>", () => {
  it("renders the list of feeds", () => {
    const feed1 = fakeWebcamFeed();
    const feed2 = fakeWebcamFeed();
    feed1.specialStatus = SpecialStatus.DIRTY;
    const p = props([feed1, feed2]);
    const el = shallow(<Edit {...p} />);
    const inputs = el
      .find("input")
      .map(x => x.get(0))
      .map(x => get(x, "value", ""));
    expect(inputs).toContain(feed1.body.name);
    expect(inputs).toContain(feed1.body.url);
    expect(inputs).toContain(feed2.body.name);
    expect(inputs).toContain(feed2.body.url);
    expect(el.text()).toContain("Save*");
    el.find("button").at(1).simulate("click");
    expect(p.save).toHaveBeenCalledWith(feed1);
    feed1.specialStatus = undefined;
    el.update();
    expect(el.text()).not.toContain("Save*");
  });
});
