import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import {
  RawSavedGardens as SavedGardens, mapStateToProps, SavedGardenHUD,
} from "../saved_gardens";
import {
  fakePlant, fakePlantTemplate, fakeSavedGarden,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { SavedGardensProps } from "../interfaces";
import * as savedGardenActions from "../actions";
import { Actions } from "../../constants";
import { Path } from "../../internal_urls";
import * as crud from "../../api/crud";
import { clickButton } from "../../__test_support__/helpers";

let editSpy: jest.SpyInstance;
let snapshotGardenSpy: jest.SpyInstance;
let applyGardenSpy: jest.SpyInstance;
let destroySavedGardenSpy: jest.SpyInstance;
let openOrCloseGardenSpy: jest.SpyInstance;
let closeSavedGardenSpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  snapshotGardenSpy = jest.spyOn(savedGardenActions, "snapshotGarden")
    .mockImplementation(jest.fn());
  applyGardenSpy = jest.spyOn(savedGardenActions, "applyGarden")
    .mockImplementation(jest.fn());
  destroySavedGardenSpy = jest.spyOn(savedGardenActions, "destroySavedGarden")
    .mockImplementation(jest.fn());
  openOrCloseGardenSpy = jest.spyOn(savedGardenActions, "openOrCloseGarden")
    .mockImplementation(jest.fn());
  closeSavedGardenSpy = jest.spyOn(savedGardenActions, "closeSavedGarden")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  editSpy.mockRestore();
  snapshotGardenSpy.mockRestore();
  applyGardenSpy.mockRestore();
  destroySavedGardenSpy.mockRestore();
  openOrCloseGardenSpy.mockRestore();
  closeSavedGardenSpy.mockRestore();
});

describe("<SavedGardens />", () => {
  const fakeProps = (): SavedGardensProps => ({
    dispatch: jest.fn(),
    plantPointerCount: 1,
    savedGardens: [fakeSavedGarden()],
    plantTemplates: [fakePlantTemplate(), fakePlantTemplate()],
    openedSavedGarden: undefined,
  });

  it("renders saved gardens", () => {
    const p = fakeProps();
    p.plantTemplates[0].body.saved_garden_id = p.savedGardens[0].body.id || 0;
    p.plantTemplates[1].body.saved_garden_id = p.savedGardens[0].body.id || 0;
    const { container } = render(<SavedGardens {...p} />);
    ["saved garden 1", "2 plants"].map(string =>
      expect(container.innerHTML.toLowerCase()).toContain(string));
  });

  it("has no saved gardens yet", () => {
    const p = fakeProps();
    p.savedGardens = [];
    const { container } = render(<SavedGardens {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("no saved gardens yet");
  });

  it("changes search term", () => {
    const ref = React.createRef<SavedGardens>();
    const { container } = render(<SavedGardens ref={ref} {...fakeProps()} />);
    expect(ref.current?.state.searchTerm).toEqual("");
    fireEvent.change(container.querySelector("input") as Element, {
      target: { value: "spring" },
      currentTarget: { value: "spring" },
    });
    expect(ref.current?.state.searchTerm).toEqual("spring");
  });

  it("shows filtered gardens", () => {
    const p = fakeProps();
    p.savedGardens = [fakeSavedGarden(), fakeSavedGarden()];
    p.savedGardens[0].body.name = "winter";
    p.savedGardens[1].body.name = "spring";
    const ref = React.createRef<SavedGardens>();
    const { container } = render(<SavedGardens ref={ref} {...p} />);
    act(() => {
      ref.current?.setState({ searchTerm: "winter" });
    });
    expect(container.textContent).toContain("winter");
    expect(container.textContent).not.toContain("spring");
  });

  it("shows when garden is open", () => {
    const p = fakeProps();
    p.savedGardens = [fakeSavedGarden(), fakeSavedGarden()];
    p.openedSavedGarden = p.savedGardens[0].body.id;
    const { container } = render(<SavedGardens {...p} />);
    expect(container.innerHTML).toContain("selected");
  });
});

describe("mapStateToProps()", () => {
  it("has no plants in garden", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const result = mapStateToProps(state);
    expect(result.plantPointerCount).toEqual(0);
  });

  it("has plants in garden", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakePlant()]);
    const result = mapStateToProps(state);
    expect(result.plantPointerCount).toBeGreaterThan(0);
  });
});

describe("<SavedGardenHUD />", () => {
  it("renders", () => {
    const { container } = render(<SavedGardenHUD dispatch={jest.fn()} />);
    ["viewing saved garden", "edit", "exit"].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
  });

  it("navigates to plants", () => {
    const dispatch = jest.fn();
    const { container } = render(<SavedGardenHUD dispatch={dispatch} />);
    clickButton(container, 0, "edit");
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants());
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: undefined
    });
  });

  it("exits garden", () => {
    const { container } = render(<SavedGardenHUD dispatch={jest.fn()} />);
    clickButton(container, 1, "exit");
    expect(savedGardenActions.closeSavedGarden).toHaveBeenCalled();
  });
});
