import React from "react";
import { shallow } from "enzyme";
import { SaveBtn, SaveBtnProps } from "../save_button";
import { SpecialStatus } from "farmbot";

describe("<SaveBtn />", () => {
  const fakeProps = (): SaveBtnProps => ({
    status: SpecialStatus.SAVED,
    onClick: jest.fn(),
  });

  it.each<[SpecialStatus, string]>([
    [SpecialStatus.SAVED, "saved"],
    [SpecialStatus.DIRTY, "save"],
    [SpecialStatus.SAVING, "saving"],
  ])("returns button with status %s %s", (status, text) => {
    const p = fakeProps();
    p.status = status;
    const wrapper = shallow(<SaveBtn {...p} />);
    expect(wrapper.text().toLowerCase()).toContain(text);
  });
});
