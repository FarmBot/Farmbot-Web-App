import * as React from "react";
import { TitleBar } from "../title";
import { mount } from "enzyme";
import { get } from "lodash";

describe("<TitleBar/>", () => {
  it("hides elements when call bakcs are not provided", () => {
    let props = { title: "WOW!", help: "COOL!" };
    let el = mount(<TitleBar {...props} />);
    expect(el.text()).toContain(props.title);
    expect(el.text()).toContain(props.help);
    el.find("button").forEach(html => {
      expect(get(html.props(), "hidden")).toBe(true);
    });
  });
});
