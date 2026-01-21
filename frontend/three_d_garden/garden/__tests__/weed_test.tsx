import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Weed, WeedProps, WeedSphereInstances } from "../weed";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { fakeWeed } from "../../../__test_support__/fake_state/resources";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";

describe("<Weed />", () => {
  const fakeProps = (): WeedProps => ({
    config: clone(INITIAL),
    weed: fakeWeed(),
    visible: true,
    getZ: () => 0,
  });
  afterEach(() => {
    document.querySelector(".garden-bed-3d-model")?.remove();
  });

  const setupGardenBed = () => {
    const bed = document.createElement("div");
    bed.className = "garden-bed-3d-model";
    document.body.appendChild(bed);
    return bed;
  };

  it("renders", () => {
    const { container } = render(<Weed {...fakeProps()} />);
    expect(container).toContainHTML("weed");
  });

  it("changes cursor on hover when clickable", () => {
    location.pathname = Path.mock(Path.designer());
    const bed = setupGardenBed();
    const p = fakeProps();
    p.weed.body.id = 1;
    p.dispatch = mockDispatch(jest.fn());
    const { container } = render(<Weed {...p} />);
    const weed = container.querySelector("[name='weed-1']");
    expect(weed).not.toBeNull();
    fireEvent.pointerEnter(weed as Element);
    expect(bed.style.cursor).toEqual("pointer");
    fireEvent.pointerLeave(weed as Element);
    expect(bed.style.cursor).toEqual("move");
  });

  it("changes cursor on hover when not clickable", () => {
    location.pathname = Path.mock(Path.designer());
    const bed = setupGardenBed();
    const p = fakeProps();
    p.weed.body.id = 1;
    p.dispatch = undefined;
    const { container } = render(<Weed {...p} />);
    const weed = container.querySelector("[name='weed-1']");
    expect(weed).not.toBeNull();
    fireEvent.pointerEnter(weed as Element);
    expect(bed.style.cursor).toEqual("pointer");
    fireEvent.pointerLeave(weed as Element);
    expect(bed.style.cursor).toEqual("move");
  });

  it("navigates to weed info", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.weed.body.id = 1;
    const { container } = render(<Weed {...p} />);
    const weed = container.querySelector("[name='weed-1'");
    weed && fireEvent.click(weed);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds("1"));
  });

  it("doesn't navigate to weed info", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    p.weed.body.id = 1;
    const { container } = render(<Weed {...p} />);
    const weed = container.querySelector("[name='weed'");
    weed && fireEvent.click(weed);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("<WeedSphereInstances />", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.designer());
  });
  afterEach(() => {
    document.querySelector(".garden-bed-3d-model")?.remove();
  });

  const setupGardenBed = () => {
    const bed = document.createElement("div");
    bed.className = "garden-bed-3d-model";
    document.body.appendChild(bed);
    return bed;
  };

  const fakeProps = () => {
    const config = clone(INITIAL);
    const weed = fakeWeed();
    weed.body.id = 1;
    return { config, weed };
  };

  it("renders instanced spheres", () => {
    const { config, weed } = fakeProps();
    const { container } = render(
      <WeedSphereInstances
        weeds={[weed]}
        config={config}
        visible={true}
        getZ={() => 0} />,
    );
    expect(container.querySelector("instancedmesh")).toBeTruthy();
  });

  it("renders nothing without weeds", () => {
    const { config } = fakeProps();
    const { container } = render(
      <WeedSphereInstances
        weeds={[]}
        config={config}
        visible={true}
        getZ={() => 0} />,
    );
    expect(container.querySelector("instancedmesh")).toBeFalsy();
  });

  it("shows hover label", () => {
    const { config, weed } = fakeProps();
    config.labels = true;
    config.labelsOnHover = true;
    weed.body.name = "Weed A";
    const { container } = render(
      <WeedSphereInstances
        weeds={[weed]}
        config={config}
        visible={true}
        getZ={() => 0} />,
    );
    expect(screen.queryByText("Weed A")).not.toBeInTheDocument();
    const mesh = container.querySelector("instancedmesh");
    expect(mesh).not.toBeNull();
    fireEvent.pointerMove(mesh as Element, { instanceId: 0 });
    expect(screen.getByText("Weed A")).toBeInTheDocument();
    fireEvent.pointerLeave(mesh as Element);
    expect(screen.queryByText("Weed A")).not.toBeInTheDocument();
  });

  it("changes cursor on hover without dispatch", () => {
    const bed = setupGardenBed();
    const { config, weed } = fakeProps();
    const { container } = render(
      <WeedSphereInstances
        weeds={[weed]}
        config={config}
        visible={true}
        getZ={() => 0} />,
    );
    const mesh = container.querySelector("instancedmesh");
    expect(mesh).not.toBeNull();
    fireEvent.pointerEnter(mesh as Element, { instanceId: 0 });
    expect(bed.style.cursor).toEqual("pointer");
    fireEvent.pointerLeave(mesh as Element);
    expect(bed.style.cursor).toEqual("move");
  });
});
