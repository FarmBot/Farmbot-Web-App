import React from "react";
import { CurveInfo } from "../curve_info";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  fakeCurve, fakePlant,
} from "../../__test_support__/fake_state/resources";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { CurveInfoProps } from "../../curves/interfaces";
import { CurveType } from "../../curves/templates";
import { formatPlantInfo } from "../map_state_to_props";
import { Path } from "../../internal_urls";
import * as ui from "../../ui";

let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: {
      selectedItem?: { label: string };
      onChange: (item: {
        label: string;
        value: number | string;
        headingId?: string;
        isNull?: true;
      }) => void;
    }) => <div>
      <span>{props.selectedItem?.label || "None"}</span>
      <button
        className={"change-curve"}
        onClick={() => props.onChange({
          label: "",
          value: 1,
          headingId: "water",
        })} />
      <button
        className={"remove-curve"}
        onClick={() => props.onChange({
          label: "",
          value: "",
          isNull: true,
        })} />
    </div>);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
});

describe("<CurveInfo />", () => {
  const fakeProps = (): CurveInfoProps => ({
    curveType: CurveType.water,
    dispatch: jest.fn(),
    curve: fakeCurve(),
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    onChange: jest.fn(),
    plants: [],
    plant: formatPlantInfo(fakePlant()),
    curves: [],
  });

  it("displays curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curve = curve;
    p.plant = undefined;
    render(<CurveInfo {...p} />);
    expect(screen.queryByText("None")).not.toBeInTheDocument();
  });

  it("displays curve with x, y", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curve = curve;
    const plant = fakePlant();
    plant.body.openfarm_slug = "mint";
    plant.body.water_curve_id = 1;
    plant.body.x = 100;
    plant.body.y = 200;
    p.plant = formatPlantInfo(plant);
    p.plants = [plant];
    p.curves = [curve];
    render(<CurveInfo {...p} />);
    expect(screen.queryByText("None")).not.toBeInTheDocument();
  });

  it("doesn't display curve", () => {
    const p = fakeProps();
    p.curve = undefined;
    render(<CurveInfo {...p} />);
    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("changes curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curves = [curve];
    const { container } = render(<CurveInfo {...p} />);
    fireEvent.click(container.querySelector(".change-curve") as Element);
    expect(p.onChange).toHaveBeenCalledWith(1, CurveType.water);
  });

  it("removes curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curves = [curve];
    const { container } = render(<CurveInfo {...p} />);
    fireEvent.click(container.querySelector(".remove-curve") as Element);
    expect(p.onChange).toHaveBeenCalledWith(undefined, CurveType.water);
  });
});
