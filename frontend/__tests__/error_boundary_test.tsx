jest.unmock("../error_boundary");

jest.mock("../util/errors.ts", () => ({ catchErrors: jest.fn() }));

import React from "react";
import { mount } from "enzyme";
import { ErrorBoundary } from "../error_boundary";
import { catchErrors } from "../util";

class Kaboom extends React.Component<{}, {}> {
  TRUE = (1 + 1) === 2;

  render() {
    if (this.TRUE) {
      throw new Error("ALWAYS");
    } else {
      return <div />;
    }
  }
}

describe("<ErrorBoundary/>", () => {
  it("handles exceptions", () => {
    console.error = jest.fn();
    const nodes = <ErrorBoundary><Kaboom /></ErrorBoundary>;
    const el = mount<ErrorBoundary>(nodes);
    expect(el.text()).toContain("can't render this part of the page");
    const i = el.instance();
    expect(i.state.hasError).toBe(true);
    expect(catchErrors).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Kaboom"));
  });
});
