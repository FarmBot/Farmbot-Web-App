import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { FilterNearTime } from "../filter_near_time";
import { ImageFilterProps } from "../../images/interfaces";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import * as photoFilterActions from "../actions";

let setWebAppConfigValuesSpy: jest.SpyInstance;

beforeEach(() => {
  setWebAppConfigValuesSpy = jest.spyOn(photoFilterActions, "setWebAppConfigValues")
    .mockImplementation(jest.fn());
});


describe("<FilterNearTime />", () => {
  const fakeProps = (): ImageFilterProps => ({
    image: fakeImage(),
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
  });

  it("changes value", () => {
    const p = fakeProps();
    render(<FilterNearTime {...p} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(1);
    fireEvent.change(input, { target: { value: "2" } });
    expect(input).toHaveValue(2);
  });

  it("sets filter settings for around image time", () => {
    const p = fakeProps();
    p.image && (p.image.body.created_at = "2001-01-03T05:00:01.000Z");
    render(<FilterNearTime {...p} />);
    fireEvent.change(screen.getByRole("spinbutton"),
      { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "this photo" }));
    expect(setWebAppConfigValuesSpy).toHaveBeenCalledWith({
      photo_filter_begin: "2001-01-03T04:58:01.000Z",
      photo_filter_end: "2001-01-03T05:02:01.000Z",
    });
  });
});
