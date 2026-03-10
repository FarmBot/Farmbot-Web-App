import React from "react";
import { render, screen } from "@testing-library/react";
import { FilterOlderOrNewer } from "../filter_older_or_newer";
import { ImageFilterProps } from "../../images/interfaces";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";

describe("<FilterOlderOrNewer />", () => {
  const fakeProps = (): ImageFilterProps => ({
    image: fakeImage(),
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
  });

  it("renders", () => {
    render(<FilterOlderOrNewer {...fakeProps()} />);
    expect(screen.getByText(/newer/i)).toBeInTheDocument();
  });
});
