jest.mock("../../../history", () => ({
  push: jest.fn(),
  getPathArray: () => [],
}));

import {
  fakeSequence, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
let mockGet = Promise.resolve({ data: fakeSequence().body });
jest.mock("axios", () => ({
  get: jest.fn(() => mockGet),
}));

import React from "react";
import { mount } from "enzyme";
import {
  mapStateToProps,
  RawDesignerSequencePreview as DesignerSequencePreview,
  SequencePreviewProps,
} from "../preview";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { API } from "../../../api";
import { fakeState } from "../../../__test_support__/fake_state";
import { BooleanSetting } from "../../../session_keys";

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.show_pins = true;
    state.resources = buildResourceIndex([config]);
    const props = mapStateToProps(state);
    expect(props.getWebAppConfigValue(BooleanSetting.show_pins)).toEqual(true);
  });
});

describe("<DesignerSequencePreview />", () => {
  API.setBaseUrl("");

  const fakeProps = (): SequencePreviewProps => ({
    dispatch: jest.fn(),
    resources: buildResourceIndex().index,
    getWebAppConfigValue: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<DesignerSequencePreview {...fakeProps()} />);
    ["import", "loading"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.find(".fa-code").length).toEqual(0);
  });

  it("loads sequence", async () => {
    const sequence = fakeSequence();
    sequence.body.body = [
      { kind: "move_relative", args: { x: 0, y: 0, z: 0, speed: 100 } },
      { kind: "read_pin", args: { pin_number: 0, pin_mode: 0, label: "---" } },
      { kind: "write_pin", args: { pin_number: 0, pin_value: 0, pin_mode: 0 } },
    ];
    mockGet = Promise.resolve({ data: sequence.body });
    const wrapper = await mount(<DesignerSequencePreview {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("speed");
  });

  it("loads sequence without body", async () => {
    const sequence = fakeSequence();
    sequence.body.body = undefined;
    mockGet = Promise.resolve({ data: sequence.body });
    const wrapper = await mount(<DesignerSequencePreview {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("loading");
  });

  it("views as celery script", async () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => true;
    const wrapper = await mount<DesignerSequencePreview>(
      <DesignerSequencePreview {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("kind");
    wrapper.instance().toggleViewRaw();
    expect(wrapper.text().toLowerCase()).toContain("kind");
  });
});
