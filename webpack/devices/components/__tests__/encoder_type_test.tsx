import * as React from "react";
import { EncoderType, EncoderTypeProps } from "../encoder_type";
import { shallow } from "enzyme";
import { FBSelect } from "../../../ui/new_fb_select";

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
