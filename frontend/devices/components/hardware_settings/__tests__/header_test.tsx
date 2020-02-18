import * as React from "react";
import { Header } from "../header";
import { mount } from "enzyme";
import { DeviceSetting } from "../../../../constants";

describe("<Header/>", () => {
  it("renders", () => {
    const fn = jest.fn();
    const el = mount(<Header
      title={DeviceSetting.motors}
      expanded={true}
      panel={"motors"}
      dispatch={fn} />);
    expect(el.text().toLowerCase()).toContain("motors");
    expect(el.find(".fa-minus").length).toBe(1);
  });
});
