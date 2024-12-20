import {
  fakeSequence,
} from "../../../__test_support__/fake_state/resources";
let mockGet = Promise.resolve({ data: fakeSequence().body });
jest.mock("axios", () => ({
  get: jest.fn(() => mockGet),
  post: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../actions", () => ({
  installSequence: jest.fn(() => () => Promise.resolve()),
}));

import React from "react";
import { mount } from "enzyme";
import {
  RawDesignerSequencePreview as DesignerSequencePreview,
} from "../preview";
import { SequencePreviewProps } from "../preview_support";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { API } from "../../../api";
import { installSequence } from "../../actions";
import { Path } from "../../../internal_urls";
import { emptyState } from "../../../resources/reducer";
import { Content } from "../../../constants";

describe("<DesignerSequencePreview />", () => {
  API.setBaseUrl("");

  const fakeProps = (): SequencePreviewProps => ({
    dispatch: jest.fn(),
    resources: buildResourceIndex().index,
    getWebAppConfigValue: jest.fn(),
    sequencesState: emptyState().consumers.sequences,
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
    expect(mockNavigate).toHaveBeenCalledWith(Path.designerSequences());
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

  it("shows warning", async () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: "" } }];
    mockGet = Promise.resolve({ data: sequence.body });
    const wrapper = await mount(<DesignerSequencePreview {...fakeProps()} />);
    expect(wrapper.text()).toContain(Content.INCLUDES_LUA_WARNING);
  });

  it("doesn't show warning", async () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "sync", args: {} }];
    mockGet = Promise.resolve({ data: sequence.body });
    const wrapper = await mount(<DesignerSequencePreview {...fakeProps()} />);
    expect(wrapper.text()).not.toContain(Content.INCLUDES_LUA_WARNING);
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
