import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Actions } from "../../../constants";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { ImageShowMenu, ImageShowMenuTarget } from "../image_show_menu";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import { ImageShowProps } from "../interfaces";

describe("<ImageShowMenu />", () => {
  const fakeProps = (): ImageShowProps => ({
    image: fakeImage(),
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
  });

  it("renders as shown in map", () => {
    render(<ImageShowMenu {...fakeProps()} />);
    expect(screen.queryByText(/not shown in map/i)).toBeNull();
  });

  it("handles missing image", () => {
    const p = fakeProps();
    p.image = undefined;
    render(<ImageShowMenu {...p} />);
    expect(screen.queryByText(/not shown in map/i)).toBeNull();
  });

  it("renders as not shown in map", () => {
    const p = fakeProps();
    p.flags.inRange.value = false;
    render(<ImageShowMenu {...p} />);
    expect(screen.getByText(/not shown in map/i)).toBeInTheDocument();
  });

  it("renders as temporarily shown in map", () => {
    const p = fakeProps();
    p.flags.alwaysShow.value = true;
    p.flags.inRange.value = false;
    const { container } = render(<ImageShowMenu {...p} />);

    expect(screen.getByText("temporarily shown in map")).toBeInTheDocument();
    expect(screen.getByText("not typically shown in map")).toBeInTheDocument();
    expect(screen.getByText("'Always highlight' enabled"))
      .toBeInTheDocument();
    expect(container.querySelector(".fa-check-circle.orange")).toBeTruthy();
  });

  it("sets map image highlight", () => {
    const p = fakeProps();
    p.image && (p.image.body.id = 1);
    const { container } = render(<ImageShowMenu {...p} />);
    const section = container.querySelector(".shown-in-map-details");
    fireEvent.mouseEnter(section as HTMLElement);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: 1,
    });
    fireEvent.mouseLeave(section as HTMLElement);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });

  it("doesn't set map image highlight", () => {
    const p = fakeProps();
    p.image = undefined;
    const { container } = render(<ImageShowMenu {...p} />);
    const section = container.querySelector(".shown-in-map-details");
    fireEvent.mouseEnter(section as HTMLElement);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });

  it("hides map image", () => {
    const p = fakeProps();
    p.image && (p.image.body.id = 1);
    render(<ImageShowMenu {...p} />);
    expect(screen.getByRole("button", { name: /hide/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /hide/i }));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIDE_MAP_IMAGE, payload: 1,
    });
  });

  it("doesn't hide map image", () => {
    const p = fakeProps();
    p.image = undefined;
    render(<ImageShowMenu {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /hide/i }));
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("shows map image", () => {
    const p = fakeProps();
    p.image && (p.image.body.id = 1);
    p.flags.notHidden.value = false;
    render(<ImageShowMenu {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /show/i }));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.UN_HIDE_MAP_IMAGE, payload: 1,
    });
  });
});

describe("<ImageShowMenuTarget />", () => {
  const fakeProps = (): ImageShowProps => ({
    image: undefined,
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
  });

  it("handles missing image", () => {
    const p = fakeProps();
    const { container } = render(<ImageShowMenuTarget {...p} />);
    const icon = container.querySelector("i");
    expect(icon?.className).toContain("fa-eye");
    fireEvent.mouseEnter(icon as HTMLElement);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });

  it("shows the temporary map state", () => {
    const p = fakeProps();
    p.flags.alwaysShow.value = true;
    p.flags.inRange.value = false;
    const { container } = render(<ImageShowMenuTarget {...p} />);
    const icon = container.querySelector("i");

    expect(icon?.className).toContain("fa-eye-slash");
    expect(icon?.className).toContain("orange");
    expect(icon?.title).toEqual("temporarily in map");
  });

  it("doesn't show the temporary state when the layer is off", () => {
    const p = fakeProps();
    p.flags.layerOn.value = false;
    p.flags.alwaysShow.value = true;
    const { container } = render(<ImageShowMenuTarget {...p} />);
    const icon = container.querySelector("i");

    expect(icon?.className).toContain("gray");
    expect(icon?.title).toEqual("not in map");
  });
});
