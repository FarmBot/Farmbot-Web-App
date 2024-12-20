import React from "react";
import { shallow } from "enzyme";
import { Link } from "../link";

describe("<Link/>", () => {
  it("renders child elements", () => {
    function Child(_: unknown) { return <p>Hey!</p>; }
    const el = shallow(<Link to="/wherever"><Child /></Link>);
    expect(el.html()).toContain("Hey!");
    el.unmount();
  });

  it("navigates", () => {
    const wrapper = shallow(<Link to="/tools" />);
    wrapper.simulate("click", { preventDefault: jest.fn() });
    expect(mockNavigate).toHaveBeenCalledWith("/tools");
  });

  it("doesn't navigate when disabled", () => {
    const wrapper = shallow(<Link to="/tools" disabled={true} />);
    wrapper.simulate("click", { preventDefault: jest.fn() });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
