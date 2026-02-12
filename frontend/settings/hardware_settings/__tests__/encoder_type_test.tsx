import React from "react";
import {
  EncoderType, EncoderTypeProps, LOOKUP, findByType, isEncoderValue,
} from "../encoder_type";
import { render } from "@testing-library/react";
import { Encoder } from "farmbot";

const fbSelectMock = jest.fn((_: unknown) => <div />);

jest.mock("../../../ui", () => {
  const actual = jest.requireActual("../../../ui");
  return {
    ...actual,
    FBSelect: (props: unknown) => fbSelectMock(props),
  };
});

describe("<EncoderType/>", () => {
  const fakeProps = (): EncoderTypeProps => ({
    hardware: {
      encoder_type_x: 1,
      encoder_type_y: 1,
      encoder_type_z: 1
    },
    onChange: jest.fn(),
  });

  it("renders default content", () => {
    fbSelectMock.mockClear();
    render(<EncoderType {...fakeProps()} />);
    expect(fbSelectMock.mock.calls.length).toEqual(3);
  });

  it("changes encoder type", () => {
    fbSelectMock.mockClear();
    const p = fakeProps();
    render(<EncoderType {...p} />);
    const props = fbSelectMock.mock.calls[0]?.[0] as {
      onChange: (ddi: { label: string, value: number }) => void,
    };
    props.onChange({ label: "", value: 1 });
    expect(p.onChange).toHaveBeenCalledWith("encoder_type_x", 1);
  });

  it("handles bad encoder type", () => {
    fbSelectMock.mockClear();
    const p = fakeProps();
    render(<EncoderType {...p} />);
    const props = fbSelectMock.mock.calls[0]?.[0] as {
      onChange: (ddi: { label: string, value: number }) => void,
    };
    const change = () => props.onChange({ label: "", value: 2 });
    expect(change).toThrow("Got bad encoder type in device panel.");
    expect(p.onChange).not.toHaveBeenCalled();
  });
});

describe("findByType", () => {
  it("handles undefined", () => {
    expect(findByType(undefined)).toBe(LOOKUP.DEFAULT);
  });

  it("Handles known values like Encoder.differential", () => {
    expect(findByType(Encoder.differential)).toBe(LOOKUP[Encoder.differential]);
  });

  it("Handles bad values like NaN", () => {
    expect(findByType(-99)).toBe(LOOKUP.DEFAULT);
  });
});

describe("isEncoderValue", () => {
  it("determines typefulness", () => {
    expect(isEncoderValue(-9)).toBeFalsy();
    expect(isEncoderValue(Encoder.quadrature)).toBeTruthy();
  });
});
