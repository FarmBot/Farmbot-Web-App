import * as React from "react";
import {
  EncoderType, EncoderTypeProps, LOOKUP, findByType, isEncoderValue
} from "../encoder_type";
import { shallow } from "enzyme";
import { FBSelect } from "../../../../ui/index";
import { Encoder } from "farmbot";

describe("<EncoderType/>", () => {
  it("renders default content", () => {
    const props: EncoderTypeProps = {
      hardware: {
        encoder_type_x: 1,
        encoder_type_y: 1,
        encoder_type_z: 1
      },
      onChange: jest.fn()
    };
    const el = shallow(<EncoderType {...props} />);
    expect(el.find(FBSelect).length).toEqual(3);
    // EncoderType
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
