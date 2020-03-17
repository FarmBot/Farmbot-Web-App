import React from "react";
import { ReadOnlyIcon } from "..";
import { shallow } from "enzyme";

describe("<ReadOnlyIcon/>", () => {
  it("shows nothing when unlocked", () => {
    const result = shallow(<ReadOnlyIcon locked={false} />);
    expect(result.html())
      .toEqual("<div class=\"read-only-mode-disabled\"></div>");
  });

  it("hows the pencil icon when locked", () => {
    const result = shallow(<ReadOnlyIcon locked={true} />);
    expect(result.find(".fa-pencil").length).toBe(1);
    expect(result.find(".fa-ban").length).toBe(1);
  });
});
