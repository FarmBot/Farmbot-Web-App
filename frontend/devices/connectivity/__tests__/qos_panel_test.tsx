import React from "react";
import { QosPanel, QosPanelProps, colorFromPercentOK } from "../qos_panel";
import { fakePings } from "../../../__test_support__/fake_state/pings";
import { render } from "@testing-library/react";
import { Actions } from "../../../constants";

describe("<QosPanel />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fakeProps = (): QosPanelProps => ({
    pings: fakePings(),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<QosPanel {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("percent ok: 50 %");
    expect(container.innerHTML).toContain("green");
    expect(container.textContent).not.toContain("---");
  });

  it("renders slow pings", () => {
    const p = fakeProps();
    p.pings = { "ping": { kind: "complete", start: 0, end: 700 } };
    const { container } = render(<QosPanel {...p} />);
    expect(container.innerHTML).toContain("yellow");
  });

  it("renders slower pings", () => {
    const p = fakeProps();
    p.pings = { "ping": { kind: "complete", start: 0, end: 1000 } };
    const { container } = render(<QosPanel {...p} />);
    expect(container.innerHTML).toContain("red");
  });

  it("renders when empty", () => {
    const p = fakeProps();
    p.pings = {};
    const { container } = render(<QosPanel {...p} />);
    expect(container.textContent).toContain("---");
  });

  it("calls onFocus callback", () => {
    const p = fakeProps();
    const ref = React.createRef<QosPanel>();
    render(<QosPanel {...p} ref={ref} />);
    ref.current?.onFocus();
    expect(p.dispatch).toHaveBeenCalledWith(
      { type: Actions.CLEAR_PINGS, payload: undefined });
  });
});

describe("colorFromPercentOK()", () => {
  it("returns green", () => {
    expect(colorFromPercentOK(1)).toEqual("green");
    expect(colorFromPercentOK(0.9)).toEqual("green");
  });

  it("returns yellow", () => {
    expect(colorFromPercentOK(0.8)).toEqual("yellow");
    expect(colorFromPercentOK(0.89)).toEqual("yellow");
  });

  it("returns red", () => {
    expect(colorFromPercentOK(0.79)).toEqual("red");
    expect(colorFromPercentOK(0)).toEqual("red");
  });
});
