import React from "react";
import {
  render, fireEvent, screen, waitFor, act,
} from "@testing-library/react";
import {
  Bugs, BugsProps, showBugResetButton, showBugs, resetBugs, BugsControls,
  BugsSettings,
} from "../bugs";
import { EggKeys, setEggStatus, getEggStatus } from "../status";
import { range } from "lodash";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { FilePath } from "../../../../internal_urls";

const expectAlive = (value: string) =>
  expect(getEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE)).toEqual(value);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("<Bugs />", () => {
  const fakeProps = (): BugsProps => ({
    mapTransformProps: fakeMapTransformProps(),
    botSize: {
      x: { value: 3000, isDefault: true },
      y: { value: 1500, isDefault: true },
      z: { value: 400, isDefault: true },
    },
  });

  const renderBugs = (props: BugsProps, ref?: React.RefObject<Bugs | null>) =>
    render(<svg><Bugs {...props} ref={ref} /></svg>);

  const queryImages = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("image"));

  it("renders", async () => {
    const { container } = renderBugs(fakeProps());
    await waitFor(() => expect(queryImages(container).length).toEqual(10));
    const firstBug = queryImages(container)[0];
    expect(firstBug.getAttribute("class")).toContain("bug");
    expect(firstBug.getAttribute("filter")).toEqual("");
    expect(Number(firstBug.getAttribute("opacity"))).toEqual(1);
    expect(firstBug.getAttribute("xlink:href") ||
      firstBug.getAttribute("href"))
      .toContain(FilePath.bug());
  });

  it("kills bugs", async () => {
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "");
    expectAlive("");
    const ref = React.createRef<Bugs>();
    const { container } = renderBugs(fakeProps(), ref);
    await waitFor(() => expect(queryImages(container).length).toEqual(10));
    act(() => {
      ref.current?.setState(state => ({
        ...state,
        bugs: state.bugs.map((bug, index) =>
          index == 0 ? { ...bug, r: 101 } : bug),
      }));
    });
    range(10).map(index => fireEvent.click(queryImages(container)[index]));
    expectAlive("");
    range(10).map(index => fireEvent.click(queryImages(container)[index]));
    expectAlive("false");
    const firstBug = queryImages(container)[0];
    expect(firstBug.getAttribute("class")).toContain("dead");
    expect(firstBug.getAttribute("filter")).toContain("grayscale");
    expect(ref.current?.state.bugs[0]).toEqual(expect.objectContaining({
      alive: false,
      hp: 50,
    }));
  });
});

describe("showBugResetButton()", () => {
  it("is truthy", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "false");
    expect(showBugResetButton()).toBeTruthy();
  });
  it("is falsy", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "true");
    expect(showBugResetButton()).toBeFalsy();
  });
});

describe("showBugs()", () => {
  it("is truthy", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "true");
    expect(showBugs()).toBeTruthy();
  });
  it("is falsy", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "");
    expect(showBugs()).toBeFalsy();
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "false");
    expect(showBugs()).toBeFalsy();
  });
});

describe("resetBugs()", () => {
  it("resets bugs", () => {
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "false");
    resetBugs();
    expectAlive("true");
  });
});

describe("<BugsControls />", () => {
  it("lays eggs", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "");
    const noEggs = render(<BugsControls />);
    expect(noEggs.container.querySelectorAll(".more-bugs").length).toEqual(0);
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    const stillNoEggs = render(<BugsControls />);
    expect(stillNoEggs.container.querySelectorAll(".more-bugs").length)
      .toEqual(0);
    setEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE, "false");
    const eggs = render(<BugsControls />);
    expect(eggs.container.querySelectorAll(".more-bugs").length).toEqual(1);
  });
});

describe("<BugsSettings />", () => {
  it("toggles setting on", () => {
    localStorage.setItem(EggKeys.BRING_ON_THE_BUGS, "");
    const { container } = render(<BugsSettings />);
    expect(screen.getByText(/bug/i)).toBeTruthy();
    const button = container.querySelector("button");
    if (!button) { throw new Error("Missing settings button"); }
    fireEvent.click(button);
    expect(localStorage.getItem(EggKeys.BRING_ON_THE_BUGS)).toEqual("true");
  });

  it("toggles setting off", () => {
    localStorage.setItem(EggKeys.BRING_ON_THE_BUGS, "true");
    const { container } = render(<BugsSettings />);
    expect(screen.getByText(/bug/i)).toBeTruthy();
    const button = container.querySelector("button");
    if (!button) { throw new Error("Missing settings button"); }
    fireEvent.click(button);
    expect(localStorage.getItem(EggKeys.BRING_ON_THE_BUGS)).toEqual("");
  });
});
