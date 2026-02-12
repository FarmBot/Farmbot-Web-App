import React from "react";
import { render } from "@testing-library/react";
import { TileTakePhoto } from "../tile_take_photo";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { StepParams } from "../../interfaces";
import {
  fakeFarmwareData, fakeStepParams,
} from "../../../__test_support__/fake_sequence_step_data";
import { Content } from "../../../constants";
import { TakePhoto } from "farmbot";
import { Path } from "../../../internal_urls";

describe("<TileTakePhoto/>", () => {
  const fakeProps = (): StepParams<TakePhoto> => ({
    ...fakeStepParams({ kind: "take_photo", args: {} }),
    currentSequence: fakeSequence(),
    farmwareData: fakeFarmwareData(),
  });

  it("renders step", () => {
    const { container } = render(<TileTakePhoto {...fakeProps()} />);
    expect(container.textContent?.toLowerCase())
      .toContain("photos are viewable from the photos panel.");
  });

  it("renders inputs", () => {
    const { container } = render(<TileTakePhoto {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toEqual(1);
    expect(inputs[0]?.getAttribute("placeholder")).toEqual("Take a Photo");
    expect(container.innerHTML).toContain(Path.photos());
    expect(container.textContent).toContain("photos panel");
  });

  it("displays warning when camera is disabled", () => {
    const p = fakeProps();
    p.farmwareData && (p.farmwareData.cameraDisabled = true);
    const { container } = render(<TileTakePhoto {...p} />);
    expect(container.innerHTML).toContain(Content.NO_CAMERA_SELECTED);
  });
});
