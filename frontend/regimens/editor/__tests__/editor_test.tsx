import React from "react";
import { render } from "@testing-library/react";
import {
  RawDesignerRegimenEditor as DesignerRegimenEditor,
} from "../../editor/editor";
import { RegimenEditorProps } from "../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import * as activeRegimen from "../../set_active_regimen_by_name";
import { Color } from "farmbot";
import * as crud from "../../../api/crud";
import * as addRegimenModule from "../../list/add_regimen";
import * as popover from "../../../ui/popover";

const findByPredicate = (
  node: React.ReactNode,
  predicate: (element: React.ReactElement<{ children?: React.ReactNode }>) => boolean,
): React.ReactElement<{ children?: React.ReactNode }> | undefined => {
  if (!node) { return undefined; }
  if (Array.isArray(node)) {
    for (const child of React.Children.toArray(node)) {
      const found = findByPredicate(child, predicate);
      if (found) { return found; }
    }
    return undefined;
  }
  if (!React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return undefined;
  }
  if (predicate(node)) { return node; }
  return findByPredicate(node.props.children, predicate);
};

let setActiveRegimenByNameSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let addRegimenSpy: jest.SpyInstance;
let popoverSpy: jest.SpyInstance;

beforeEach(() => {
  popoverSpy = jest.spyOn(popover, "Popover")
    .mockImplementation(({ target, content }: popover.PopoverProps) =>
      <div>{target}{content}</div>);
  setActiveRegimenByNameSpy = jest.spyOn(activeRegimen, "setActiveRegimenByName")
    .mockImplementation(jest.fn());
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  addRegimenSpy = jest.spyOn(addRegimenModule, "addRegimen")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  popoverSpy.mockRestore();
  setActiveRegimenByNameSpy.mockRestore();
  editSpy.mockRestore();
  addRegimenSpy.mockRestore();
});

describe("<DesignerRegimenEditor />", () => {
  const fakeProps = (): RegimenEditorProps => ({
    dispatch: jest.fn(),
    resources: buildResourceIndex([]).index,
    current: fakeRegimen(),
    calendar: [],
    variableData: {},
  });

  it("renders", () => {
    const { container } = render(<DesignerRegimenEditor {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("save");
  });

  it("handles missing regimen", () => {
    const p = fakeProps();
    p.current = undefined;
    const { container } = render(<DesignerRegimenEditor {...p} />);
    expect(activeRegimen.setActiveRegimenByName).toHaveBeenCalled();
    expect(container.textContent?.toLowerCase()).toContain("no regimen selected");
    expect(container.innerHTML).not.toContain("select color");
    const element = new DesignerRegimenEditor(p).render();
    const addButton = findByPredicate(element, found =>
      found.type === "button"
      && (found.props as { title?: string }).title === "add new regimen");
    expect(addButton?.props.onClick).toEqual(expect.any(Function));
    addButton?.props.onClick();
    expect(addRegimenModule.addRegimen).toHaveBeenCalled();
  });

  it("changes color", () => {
    const p = fakeProps();
    const regimen = fakeRegimen();
    regimen.body.color = "" as Color;
    p.current = regimen;
    render(<DesignerRegimenEditor {...p} />);
    const colorPickerPopover = popoverSpy.mock.calls.find(
      ([popoverProps]) =>
        !!(popoverProps.content as React.ReactElement)?.props?.onChange);
    const colorPickerCluster = colorPickerPopover?.[0]
      .content as React.ReactElement<{ onChange: (color: Color) => void }>;
    expect(colorPickerCluster).toBeTruthy();
    colorPickerCluster.props.onChange("blue");
    expect(crud.edit).toHaveBeenCalledWith(p.current, { color: "blue" });
  });

  it("active editor", () => {
    const { container } = render(<DesignerRegimenEditor {...fakeProps()} />);
    ["Foo", "Saved", "Schedule item"].map(string =>
      expect(container.textContent).toContain(string));
  });

  it("empty editor", () => {
    const props = fakeProps();
    props.current = undefined;
    const { container } = render(<DesignerRegimenEditor {...props} />);
    ["No Regimen selected."].map(string =>
      expect(container.textContent).toContain(string));
  });
});
