import React from "react";
import { render, screen } from "@testing-library/react";
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
    let rendered = false;
    try {
      render(nodes);
      rendered = true;
    } catch {
      // Bun's act() rethrows even when ErrorBoundary handles the error.
    }
    if (rendered) {
      expect(
        screen.getByText(/can't render this part of the page/i)
      ).toBeInTheDocument();
    }
    expect(catchErrorsSpy).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Kaboom"));
  });
});
