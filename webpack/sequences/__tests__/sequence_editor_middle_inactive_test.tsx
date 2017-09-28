import * as React from "react";
import { SequenceEditorMiddleInactive, IMAGE_PATH } from "../sequence_editor_middle_inactive";
import { shallow } from "enzyme";
import { Content } from "../../constants";

describe("<SequenceEditorMiddleInactive/>", () => {
  it("renders empty SVG image", () => {
    const el = shallow(<SequenceEditorMiddleInactive />);
    const img = el.find("img");
    expect(img.length).toBe(1);
    expect(img.props().src).toBe(IMAGE_PATH);
    expect(el.text()).toContain(Content.NO_SEQUENCE_SELECTED);
  });
});
