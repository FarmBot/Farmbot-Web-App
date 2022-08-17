jest.mock("../history", () => ({ push: jest.fn() }));

import React from "react";
import { shallow } from "enzyme";
import { clickHandler, Link } from "../link";
import { push } from "../history";

describe("clickHandler", () => {
  function setupClickTest(to: string) {
    const onClick = jest.fn();
    const handler = clickHandler({ to, onClick });
    type ClickEvent = React.MouseEvent<HTMLAnchorElement>;
    const e: Partial<ClickEvent> = { preventDefault: jest.fn() };
    return {
      e: e as ClickEvent,
      handler,
      onClick
    };
  }

  it("handles clicks", () => {
    const { e, handler } = setupClickTest("/app/foo/bar");
    handler(e);
    expect(e.preventDefault).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/app/foo/bar");
  });
});

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
    expect(push).toHaveBeenCalledWith("/tools");
  });

  it("doesn't navigate when disabled", () => {
    const wrapper = shallow(<Link to="/tools" disabled={true} />);
    wrapper.simulate("click", { preventDefault: jest.fn() });
    expect(push).not.toHaveBeenCalled();
  });
});
