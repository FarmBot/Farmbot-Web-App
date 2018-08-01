import * as React from "react";
import { shallow } from "enzyme";
import { RetryBtn } from "../retry_btn";
import { SpecialStatus } from "farmbot";

describe("<RetryBtn/>", () => {
  it("is green before saving", () => {
    const props = {
      flags: [true],
      onClick: jest.fn(),
      status: SpecialStatus.SAVED
    };
    const el = shallow(<RetryBtn {...props} />);
    expect(el.find(".green").length).toBe(1);
    expect(el.find(".yellow").length).toBe(0);
    expect(el.find(".red").length).toBe(0);
  });

  it("is yellow during save", () => {
    const props = {
      flags: [false, true],
      onClick: jest.fn(),
      status: SpecialStatus.SAVING
    };
    const el = shallow(<RetryBtn {...props} />);
    expect(el.find(".green").length).toBe(0);
    expect(el.find(".yellow").length).toBe(1);
    expect(el.find(".red").length).toBe(0);
  });

  it("is red when problems arise", () => {
    const props = {
      flags: [true, false],
      onClick: jest.fn(),
      status: SpecialStatus.SAVED
    };
    const el = shallow(<RetryBtn {...props} />);
    expect(el.find(".green").length).toBe(0);
    expect(el.find(".yellow").length).toBe(0);
    expect(el.find(".red").length).toBe(1);
  });
});
