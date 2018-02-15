import * as React from "react";
import {
  ImageLayer, ImageLayerProps, ImageFilterMenu, ImageFilterMenuProps
} from "../image_layer";
import { shallow } from "enzyme";
import { fakeImage, fakeWebAppConfig } from "../../../../__test_support__/fake_state/resources";
import { Actions } from "../../../../constants";
import { StringConfigKey } from "../../../../config_storage/web_app_configs";

const mockConfig = fakeWebAppConfig();
jest.mock("../../../../resources/selectors", () => {
  return {
    getWebAppConfig: () => mockConfig,
    assertUuid: jest.fn()
  };
});

describe("<ImageLayer/>", () => {
  function fakeProps(): ImageLayerProps {
    const image = fakeImage();
    image.body.meta.z = 0;
    image.body.meta.name = "rotated_image";
    return {
      visible: true,
      images: [image],
      mapTransformProps: {
        quadrant: 2, gridSize: { x: 3000, y: 1500 }
      },
      cameraCalibrationData: {
        offset: { x: "0", y: "0" },
        origin: "TOP_LEFT",
        rotation: "0",
        scale: "1",
        calibrationZ: "0"
      },
      sizeOverride: { width: 10, height: 10 },
      getConfigValue: jest.fn(),
    };
  }

  it("shows images", () => {
    const p = fakeProps();
    const wrapper = shallow(<ImageLayer {...p } />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").html()).toContain("x=\"0\"");
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = shallow(<ImageLayer {...p } />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(0);
  });

  it("filters old images", () => {
    const p = fakeProps();
    p.images[0].body.created_at = "2018-01-22T05:00:00.000Z";
    p.getConfigValue = () => "2018-01-23T05:00:00.000Z";
    const wrapper = shallow(<ImageLayer {...p } />);
    const layer = wrapper.find("#image-layer");
    expect(layer.find("MapImage").length).toEqual(0);
  });
});

describe("<ImageFilterMenu />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  const getState = jest.fn(() => ({ resources: { index: {} } }));
  mockConfig.body.photo_filter_begin = "";
  mockConfig.body.photo_filter_end = "";

  const fakeProps = (): ImageFilterMenuProps => {
    return {
      tzOffset: 0,
      dispatch: jest.fn(),
      getConfigValue: jest.fn(x => mockConfig.body[x as StringConfigKey])
    };
  };

  it("renders", () => {
    const p = fakeProps();
    const wrapper = shallow(<ImageFilterMenu {...p } />);
    ["Date", "Time", "Newer than", "Older than"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  const testFilterSetDate =
    (filter: "beginDate" | "endDate",
      key: "photo_filter_begin" | "photo_filter_end",
      i: number) => {
      it(`sets filter: ${filter}`, () => {
        const p = fakeProps();
        const wrapper = shallow(<ImageFilterMenu {...p } />);
        wrapper.find("BlurableInput").at(i).simulate("commit", {
          currentTarget: { value: "2001-01-03" }
        });
        expect(wrapper.state()[filter]).toEqual("2001-01-03");
        (p.dispatch as jest.Mock).mock.calls[0][0](p.dispatch, getState);
        expect(p.dispatch).toHaveBeenCalledWith({
          type: Actions.EDIT_RESOURCE,
          payload: expect.objectContaining({
            update: { [key]: "2001-01-03T00:00:00.000Z" }
          })
        });
      });
    };

  testFilterSetDate("beginDate", "photo_filter_begin", 0);
  testFilterSetDate("endDate", "photo_filter_end", 2);

  const testFilterSetTime =
    (filter: "beginTime" | "endTime",
      key: "photo_filter_begin" | "photo_filter_end",
      i: number) => {
      it(`sets filter: ${filter}`, () => {
        const p = fakeProps();
        const wrapper = shallow(<ImageFilterMenu {...p } />);
        wrapper.setState({ beginDate: "2001-01-03", endDate: "2001-01-03" });
        wrapper.find("BlurableInput").at(i).simulate("commit", {
          currentTarget: { value: "05:00" }
        });
        expect(wrapper.state()[filter]).toEqual("05:00");
        (p.dispatch as jest.Mock).mock.calls[0][0](p.dispatch, getState);
        expect(p.dispatch).toHaveBeenCalledWith({
          type: Actions.EDIT_RESOURCE,
          payload: expect.objectContaining({
            update: { [key]: "2001-01-03T05:00:00.000Z" }
          })
        });
      });
    };

  testFilterSetTime("beginTime", "photo_filter_begin", 1);
  testFilterSetTime("endTime", "photo_filter_end", 3);

  it("loads values from config", () => {
    mockConfig.body.photo_filter_begin = "2001-01-03T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "2001-01-03T06:00:00.000Z";
    const wrapper = shallow(<ImageFilterMenu {...fakeProps() } />);
    expect(wrapper.state()).toEqual({
      beginDate: "2001-01-03", beginTime: "05:00",
      endDate: "2001-01-03", endTime: "06:00"
    });
  });
});
