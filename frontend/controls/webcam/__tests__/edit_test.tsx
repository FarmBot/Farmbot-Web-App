import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { SpecialStatus } from "farmbot";
import { Edit } from "../edit";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { WebcamPanelProps } from "../interfaces";
import * as keyValEditRow from "../key_val_edit_row";

let keyValEditRowSpy: jest.SpyInstance;

describe("<Edit />", () => {
  beforeEach(() => {
    keyValEditRowSpy = jest.spyOn(keyValEditRow, "KeyValEditRow")
      .mockImplementation((props: {
        label: string;
        value: string;
        onClick: () => void;
        onLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      }) =>
        <div className="key-value-edit-row-mock">
          <span>{props.label}</span>
          <span>{props.value}</span>
          <input
            name="label"
            value={props.label}
            onChange={props.onLabelChange} />
          <input
            name="value"
            value={props.value}
            onChange={props.onValueChange} />
          <button title="Delete" onClick={props.onClick}>
            Delete
          </button>
        </div>);
  });

  afterEach(() => {
    keyValEditRowSpy.mockRestore();
  });

  const fakeProps = (): WebcamPanelProps => {
    const feed1 = fakeWebcamFeed();
    const feed2 = fakeWebcamFeed();
    feed1.specialStatus = SpecialStatus.DIRTY;
    return {
      onToggle: jest.fn(),
      feeds: [feed1, feed2],
      init: jest.fn(),
      edit: jest.fn(),
      save: jest.fn(),
      destroy: jest.fn(),
    };
  };

  it("renders the list of feeds", () => {
    const p = fakeProps();
    const { container } = render(<Edit {...p} />);
    [
      p.feeds[0].body.name,
      p.feeds[0].body.url,
      p.feeds[1].body.name,
      p.feeds[1].body.url,
    ].map(text =>
      expect(container.innerHTML).toContain(text));
  });

  it("saves feeds", () => {
    const p = fakeProps();
    const { container } = render(<Edit {...p} />);
    const saveButton = container.querySelector("button[title='Save']");
    saveButton && fireEvent.click(saveButton);
    expect(p.save).toHaveBeenCalledWith(p.feeds[0]);
  });

  it("shows feeds as saved", () => {
    const p = fakeProps();
    p.feeds[0].specialStatus = SpecialStatus.SAVED;
    p.feeds[1].specialStatus = SpecialStatus.SAVED;
    const { container } = render(<Edit {...p} />);
    const saveButton = container.querySelector("button[title='Save']");
    expect(saveButton?.textContent).toEqual("Save");
  });

  it("deletes feed", () => {
    const p = fakeProps();
    const { container } = render(<Edit {...p} />);
    const firstDeleteButton = container.querySelector("button[title='Delete']");
    firstDeleteButton && fireEvent.click(firstDeleteButton);
    expect(p.destroy).toHaveBeenCalledWith(p.feeds[0]);
  });

  it("changes name", () => {
    const p = fakeProps();
    const { container } = render(<Edit {...p} />);
    const firstNameInput = container.querySelector("input[name='label']");
    firstNameInput &&
      fireEvent.change(firstNameInput, { target: { value: "new_name" } });
    expect(p.edit).toHaveBeenCalledWith(p.feeds[0], { name: "new_name" });
  });

  it("changes url", () => {
    const p = fakeProps();
    const { container } = render(<Edit {...p} />);
    const firstUrlInput = container.querySelectorAll("input[name='value']")[0];
    firstUrlInput &&
      fireEvent.change(firstUrlInput, { target: { value: "new_url" } });
    expect(p.edit).toHaveBeenCalledWith(p.feeds[0], { url: "new_url" });
  });
});
