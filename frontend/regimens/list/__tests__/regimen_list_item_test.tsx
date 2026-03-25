import React from "react";
import { RegimenListItemProps } from "../../interfaces";
import { RegimenListItem } from "../regimen_list_item";
import { render, fireEvent } from "@testing-library/react";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { SpecialStatus, Color } from "farmbot";
import * as regimenActions from "../../actions";
import * as crud from "../../../api/crud";
import { Path } from "../../../internal_urls";
import * as popover from "../../../ui/popover";
import { ColorPicker } from "../../../ui";

let selectRegimenSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let popoverSpy: jest.SpyInstance;

beforeEach(() => {
  selectRegimenSpy = jest.spyOn(regimenActions, "selectRegimen")
    .mockImplementation(jest.fn());
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  popoverSpy = jest.spyOn(popover, "Popover")
    .mockImplementation(({ target, content }: popover.PopoverProps) =>
      <div>{target}{content}</div>);
});

afterEach(() => {
  selectRegimenSpy.mockRestore();
  editSpy.mockRestore();
  popoverSpy.mockRestore();
});

const findByType = (
  node: React.ReactNode,
  type: unknown,
): React.ReactElement<{
  children?: React.ReactNode;
  onChange?: (color: Color) => void;
}> | undefined => {
  if (!node) { return undefined; }
  if (Array.isArray(node)) {
    for (const child of React.Children.toArray(node)) {
      const found = findByType(child, type);
      if (found) { return found; }
    }
    return undefined;
  }
  if (React.isValidElement(node)) {
    if (node.type === type) {
      return node as React.ReactElement<{
        children?: React.ReactNode;
        onChange?: (color: Color) => void;
      }>;
    }
    return findByType(
      (node.props as { children?: React.ReactNode }).children, type);
  }
  return undefined;
};

describe("<RegimenListItem/>", () => {
  const fakeProps = (): RegimenListItemProps => ({
    regimen: fakeRegimen(),
    dispatch: jest.fn(),
    inUse: false
  });

  it("renders the base case", () => {
    const p = fakeProps();
    const { container } = render(<RegimenListItem {...p} />);
    expect(container.innerHTML).toContain(p.regimen.body.name);
    expect(container.querySelectorAll(".regimen-color").length).toEqual(1);
  });

  it("shows unsaved data indicator", () => {
    const p = fakeProps();
    p.regimen.specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<RegimenListItem {...p} />);
    expect(container.textContent).toContain("Foo *");
  });

  it("shows in-use indicator", () => {
    const p = fakeProps();
    p.inUse = true;
    const { container } = render(<RegimenListItem {...p} />);
    expect(container.querySelectorAll(".in-use").length).toEqual(1);
  });

  it("doesn't show in-use indicator", () => {
    const p = fakeProps();
    const { container } = render(<RegimenListItem {...p} />);
    expect(container.querySelectorAll(".in-use").length).toEqual(0);
  });

  it("selects regimen", () => {
    const p = fakeProps();
    p.regimen.body.name = "foo";
    const { container } = render(<RegimenListItem {...p} />);
    fireEvent.click(container.querySelector(".regimen-search-item") as Element);
    expect(selectRegimenSpy).toHaveBeenCalledWith(p.regimen.uuid);
    expect(mockNavigate).toHaveBeenCalledWith(Path.regimens("foo"));
  });

  it("changes color", () => {
    const p = fakeProps();
    const { container } = render(<RegimenListItem {...p} />);
    const redItem = container
      .querySelector(".color-picker-item-wrapper[title='red']");
    if (redItem) {
      fireEvent.click(redItem);
    } else {
      const colorPickerPopover = popoverSpy.mock.calls.find(
        ([popoverProps]) => !!(popoverProps.content as React.ReactElement<{
          onChange?: (color: Color) => void;
        }>)
          ?.props?.onChange);
      const colorPickerCluster = colorPickerPopover?.[0]
        .content as React.ReactElement<{ onChange: (color: Color) => void }>;
      colorPickerCluster?.props.onChange("red");
      if (!colorPickerCluster) {
        const element = RegimenListItem(p);
        const colorPicker = findByType(element, ColorPicker) as
          React.ReactElement<{ onChange?: (color: Color) => void }> | undefined;
        colorPicker?.props.onChange?.("red");
      }
    }
    expect(editSpy).toHaveBeenCalledWith(p.regimen, { color: "red" });
  });

  it("handles missing data", () => {
    const p = fakeProps();
    p.regimen.body.name = "";
    p.regimen.body.color = "" as Color;
    p.regimen.specialStatus = SpecialStatus.DIRTY;
    location.pathname = Path.mock(Path.regimens());
    const { container } = render(<RegimenListItem {...p} />);
    expect(container.textContent).toEqual(" *");
    expect(container.querySelectorAll(".regimen-color").length).toBeGreaterThan(0);
  });

  it("doesn't open regimen", () => {
    const { container } = render(<RegimenListItem {...fakeProps()} />);
    const colorElement = container.querySelector(".regimen-color");
    expect(colorElement).toBeTruthy();
    colorElement && fireEvent.click(colorElement);
    expect(selectRegimenSpy).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
