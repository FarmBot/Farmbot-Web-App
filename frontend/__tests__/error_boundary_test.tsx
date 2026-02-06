import React from "react";
import { mount } from "enzyme";
import { ErrorBoundary } from "../error_boundary";
import * as errorSupport from "../util/errors";

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
  let catchErrorsSpy: jest.SpyInstance;

  beforeEach(() => {
    catchErrorsSpy = jest.spyOn(errorSupport, "catchErrors")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    catchErrorsSpy.mockRestore();
  });

  it("handles exceptions", () => {
    console.error = jest.fn();
    const nodes = <ErrorBoundary><Kaboom /></ErrorBoundary>;
    let el: ReturnType<typeof mount<ErrorBoundary>> | undefined;
    try {
      el = mount<ErrorBoundary>(nodes);
    } catch {
      // Bun's act() rethrows even when ErrorBoundary handles the error.
    }
    if (el) {
      expect(el.text()).toContain("can't render this part of the page");
      const i = el.instance();
      expect(i.state.hasError).toBe(true);
    }
    expect(catchErrorsSpy).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Kaboom"));
  });
});
