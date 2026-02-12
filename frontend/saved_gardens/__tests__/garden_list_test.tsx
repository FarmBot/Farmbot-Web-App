jest.mock("../actions", () => ({ openSavedGarden: jest.fn() }));

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { GardenInfo, SavedGardenList } from "../garden_list";
import { fakeSavedGarden } from "../../__test_support__/fake_state/resources";
import { SavedGardenInfoProps, SavedGardenListProps } from "../interfaces";
import { openSavedGarden } from "../actions";

afterAll(() => {
  jest.unmock("../actions");
});
describe("<GardenInfo />", () => {
  const fakeProps = (): SavedGardenInfoProps => ({
    savedGarden: fakeSavedGarden(),
    plantTemplateCount: 0,
    dispatch: jest.fn(),
  });

  it("opens garden", () => {
    const p = fakeProps();
    const { container } = render(<GardenInfo {...p} />);
    fireEvent.click(container.firstChild as Element);
    expect(openSavedGarden).toHaveBeenCalledWith(expect.any(Function),
      p.savedGarden.body.id);
  });
});

describe("<SavedGardenList />", () => {
  const fakeProps = (): SavedGardenListProps => ({
    savedGardens: [fakeSavedGarden()],
    plantTemplates: [],
    dispatch: jest.fn(),
    plantPointerCount: 1,
    openedSavedGarden: undefined,
    searchTerm: "",
  });

  it("renders saved gardens", () => {
    const { container } = render(<SavedGardenList {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("saved garden");
  });

  it("handles missing name", () => {
    const p = fakeProps();
    const savedGarden = fakeSavedGarden();
    savedGarden.body.name = "";
    p.savedGardens = [savedGarden];
    const { container } = render(<SavedGardenList {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("0 plants");
  });
});
