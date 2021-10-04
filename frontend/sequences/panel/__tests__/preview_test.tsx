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
  post: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../actions", () => ({
  installSequence: jest.fn(() => () => Promise.resolve()),
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
}));

jest.mock("../../set_active_sequence_by_name", () => ({
  setActiveSequenceByName: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  License,
  LicenseProps,
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
import { edit } from "../../../api/crud";
import { push } from "../../../history";
import { setActiveSequenceByName } from "../../set_active_sequence_by_name";
import { installSequence } from "../../actions";

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
    ["viewing a publicly shared sequence", "loading"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.find(".fa-code").length).toEqual(0);
  });

  it("imports sequence", async () => {
    const wrapper = mount<DesignerSequencePreview>(
      <DesignerSequencePreview {...fakeProps()} />);
    const sequence = fakeSequence();
    wrapper.setState({ sequence });
    const importBtn = wrapper.find(".transparent-button").first();
    expect(importBtn.text()).toEqual("import");
    await importBtn.simulate("click");
    expect(installSequence).toHaveBeenCalledWith(sequence.body.id);
    expect(setActiveSequenceByName).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/app/designer/sequences/fake");
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
    sequence.body.description = undefined as unknown as string;
    mockGet = Promise.resolve({ data: sequence.body });
    const wrapper = await mount(<DesignerSequencePreview {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("import");
    expect(wrapper.text().toLowerCase()).not.toContain("loading");
    expect(wrapper.text().toLowerCase()).not.toContain("error");
  });

  it("errors while loading sequence", async () => {
    mockGet = Promise.reject("Error");
    const wrapper = await mount(<DesignerSequencePreview {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("import");
    expect(wrapper.text().toLowerCase()).not.toContain("loading");
    expect(wrapper.text().toLowerCase()).toContain("error");
  });

  it("views as celery script", async () => {
    const sequence = fakeSequence();
    sequence.body.name = "";
    mockGet = Promise.resolve({ data: sequence.body });
    const p = fakeProps();
    p.getWebAppConfigValue = () => true;
    const wrapper = await mount<DesignerSequencePreview>(
      <DesignerSequencePreview {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("scope_declaration");
    wrapper.instance().toggleSection("viewSequenceCeleryScript")();
    expect(wrapper.text().toLowerCase()).toContain("scope_declaration");
  });
});

describe("<License />", () => {
  const fakeProps = (): LicenseProps => ({
    collapsed: false,
    toggle: jest.fn(),
    sequence: fakeSequence(),
    dispatch: jest.fn(),
  });

  it("changes input", () => {
    const p = fakeProps();
    p.sequence.body.sequence_version_id = undefined;
    p.sequence.body.forked = false;
    p.sequence.body.sequence_versions = [1];
    const wrapper = shallow(<License {...p} />);
    wrapper.find("input").simulate("change", { currentTarget: { value: "c" } });
    expect(edit).toHaveBeenCalledWith(p.sequence, { copyright: "c" });
  });
});
