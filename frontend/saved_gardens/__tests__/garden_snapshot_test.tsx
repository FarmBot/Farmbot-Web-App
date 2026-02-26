import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { GardenSnapshotProps, GardenSnapshot } from "../garden_snapshot";
import { clickButton } from "../../__test_support__/helpers";
import { snapshotGarden, newSavedGarden, copySavedGarden } from "../actions";
import * as savedGardenActions from "../actions";
import { fakeSavedGarden } from "../../__test_support__/fake_state/resources";
import axios from "axios";

let snapshotGardenSpy: jest.SpyInstance;
let newSavedGardenSpy: jest.SpyInstance;
let copySavedGardenSpy: jest.SpyInstance;
let axiosPostSpy: jest.SpyInstance;

beforeEach(() => {
  axiosPostSpy = jest.spyOn(axios, "post")
    .mockImplementation(() => Promise.resolve({}) as never);
  snapshotGardenSpy = jest.spyOn(savedGardenActions, "snapshotGarden")
    .mockImplementation(jest.fn());
  newSavedGardenSpy = jest.spyOn(savedGardenActions, "newSavedGarden")
    .mockImplementation(jest.fn());
  copySavedGardenSpy = jest.spyOn(savedGardenActions, "copySavedGarden")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  axiosPostSpy.mockRestore();
  snapshotGardenSpy.mockRestore();
  newSavedGardenSpy.mockRestore();
  copySavedGardenSpy.mockRestore();
});
describe("<GardenSnapshot />", () => {
  const fakeProps = (): GardenSnapshotProps => ({
    currentSavedGarden: undefined,
    plantTemplates: [],
    dispatch: jest.fn(),
  });

  it("saves garden", () => {
    const { container } = render(<GardenSnapshot {...fakeProps()} />);
    clickButton(container, 0, "snapshot current garden");
    expect(snapshotGarden).toHaveBeenCalledWith(expect.any(Function), "", "");
  });

  it("copies saved garden", () => {
    const p = fakeProps();
    p.currentSavedGarden = fakeSavedGarden();
    const { container } = render(<GardenSnapshot {...p} />);
    clickButton(container, 0, "snapshot current garden");
    expect(snapshotGarden).not.toHaveBeenCalled();
    expect(copySavedGarden).toHaveBeenCalledWith({
      navigate: expect.any(Function),
      newSGName: "",
      plantTemplates: [],
      savedGarden: p.currentSavedGarden
    });
  });

  it("changes name", () => {
    const { container } = render(<GardenSnapshot {...fakeProps()} />);
    fireEvent.change(container.querySelector("input") as Element, {
      currentTarget: { value: "new name" },
      target: { value: "new name" },
    });
    expect((container.querySelector("input") as HTMLInputElement).value)
      .toEqual("new name");
  });

  it("changes notes", () => {
    const { container } = render(<GardenSnapshot {...fakeProps()} />);
    fireEvent.change(container.querySelector("textarea") as Element, {
      currentTarget: { value: "new notes" },
      target: { value: "new notes" },
    });
    expect((container.querySelector("textarea") as HTMLTextAreaElement).value)
      .toEqual("new notes");
  });

  it("creates new garden", () => {
    const { container } = render(<GardenSnapshot {...fakeProps()} />);
    fireEvent.change(container.querySelector("input") as Element, {
      currentTarget: { value: "new saved garden" },
      target: { value: "new saved garden" },
    });
    fireEvent.click(container.querySelectorAll("button")[1] as Element);
    expect(newSavedGarden).toHaveBeenCalledWith(expect.any(Function),
      "new saved garden", "");
  });
});
