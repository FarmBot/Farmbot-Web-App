import * as React from "react";
import { shallow } from "enzyme";
import { EmptyEditor, IMAGE_PATH } from "../empty_editor";
import { Content } from "../../../constants";

describe("EmptyEditor", () => {
  it("renders an SVG image on an empty page.", () => {
    const el = shallow(<EmptyEditor />);
    const img = el.find("img");
    expect(img.length).toBe(1);
    expect(img.props().src).toBe(IMAGE_PATH);
    expect(el.text()).toContain(Content.NO_REGIMEN_SELECTED);
  });
});
