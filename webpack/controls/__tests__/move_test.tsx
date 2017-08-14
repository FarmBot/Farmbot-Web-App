import * as React from "react";
import { mount } from "enzyme";
import { Move } from "../move";
import { bot } from "../../__test_support__/fake_state/bot";

describe("<Move />", () => {
  let fakeBot = bot;
  it("has default elements", () => {
    let wrapper = mount(<Move dispatch={jest.fn()}
      bot={fakeBot}
      user={undefined}
      disabled={false} />);
    let txt = wrapper.text().toLowerCase();
    expect(txt).toContain("move amount (mm)");
    expect(txt).toContain("110100100010000");
    expect(txt).toContain("x axisy axisz axis");
    expect(txt).toContain("motor");
    expect(txt).toContain("go");
  });

  it("has only raw encoder data display", () => {
    fakeBot.raw_encoders = true;
    let wrapper = mount(<Move dispatch={jest.fn()}
      bot={fakeBot}
      user={undefined}
      disabled={false} />);
    let txt = wrapper.text().toLowerCase();
    expect(txt).toContain("raw");
    expect(txt).not.toContain("scaled");
  });

  it("has both encoder data displays", () => {
    fakeBot.raw_encoders = true;
    fakeBot.scaled_encoders = true;
    let wrapper = mount(<Move dispatch={jest.fn()}
      bot={fakeBot}
      user={undefined}
      disabled={false} />);
    let txt = wrapper.text().toLowerCase();
    expect(txt).toContain("raw");
    expect(txt).toContain("scaled");
  });
});
