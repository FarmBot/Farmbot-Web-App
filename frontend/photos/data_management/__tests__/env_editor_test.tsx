jest.mock("../../../api/crud", () => ({
  initSave: jest.fn(),
  edit: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
}));

let mockDev = false;
jest.mock("../../../settings/dev/dev_support", () => {
  const actual = jest.requireActual("../../../settings/dev/dev_support");
  return {
    ...actual,
    DevSettings: {
      ...actual.DevSettings,
      showInternalEnvsEnabled: () => mockDev,
    },
  };
});

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EnvEditor } from "../env_editor";
import { EnvEditorProps } from "../interfaces";
import { destroy, edit, initSave, save } from "../../../api/crud";
import { fakeFarmwareEnv } from "../../../__test_support__/fake_state/resources";
import { error } from "../../../toast/toast";

beforeEach(() => {
  jest.clearAllMocks();
  mockDev = false;
});

afterAll(() => {
  jest.unmock("../../../api/crud");
  jest.unmock("../../../settings/dev/dev_support");
});

describe("<EnvEditor />", () => {
  const fakeProps = (): EnvEditorProps => ({
    dispatch: jest.fn(),
    farmwareEnvs: [],
  });

  it("doesn't show warning", () => {
    const { container } = render(<EnvEditor {...fakeProps()} />);
    expect(container.querySelector(".env-editor-warning")).toBeNull();
  });

  it("shows warning", () => {
    mockDev = true;
    const { container } = render(<EnvEditor {...fakeProps()} />);
    expect(container.querySelector(".env-editor-warning")).toBeTruthy();
  });

  it("saves new env", () => {
    render(<EnvEditor {...fakeProps()} />);
    const [keyInput, valueInput] = screen.getAllByRole("textbox");
    fireEvent.change(keyInput, { target: { value: "key" } });
    fireEvent.change(valueInput, { target: { value: "value" } });
    fireEvent.click(screen.getByTitle(/add/i));
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv",
      { key: "key", value: "value" });
    expect(error).not.toHaveBeenCalled();
  });

  it("doesn't save blank key", () => {
    render(<EnvEditor {...fakeProps()} />);
    fireEvent.click(screen.getByTitle(/add/i));
    expect(initSave).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Key cannot be blank.");
  });

  it("doesn't save duplicate key", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "key";
    p.farmwareEnvs = [farmwareEnv];
    render(<EnvEditor {...p} />);
    fireEvent.change(screen.getAllByRole("textbox")[0], {
      target: { value: "key" }
    });
    fireEvent.click(screen.getByTitle(/add/i));
    expect(initSave).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Key has already been taken.");
  });

  it("edits key", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    p.farmwareEnvs = [farmwareEnv];
    render(<EnvEditor {...p} />);
    const input = screen.getAllByRole("textbox")[2];
    fireEvent.change(input, { target: { value: "key" } });
    fireEvent.blur(input);
    expect(edit).toHaveBeenCalledWith(farmwareEnv, { key: "key" });
    expect(save).toHaveBeenCalledWith(farmwareEnv.uuid);
  });

  it("edits value", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    p.farmwareEnvs = [farmwareEnv];
    render(<EnvEditor {...p} />);
    const input = screen.getAllByRole("textbox")[3];
    fireEvent.change(input, { target: { value: "value" } });
    fireEvent.blur(input);
    expect(edit).toHaveBeenCalledWith(farmwareEnv, { value: "value" });
    expect(save).toHaveBeenCalledWith(farmwareEnv.uuid);
  });

  it("deletes env", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    p.farmwareEnvs = [farmwareEnv];
    render(<EnvEditor {...p} />);
    fireEvent.click(screen.getByTitle(/^delete$/i));
    expect(destroy).toHaveBeenCalledWith(farmwareEnv.uuid);
  });

  it("deletes internal env", () => {
    mockDev = true;
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "camera";
    p.farmwareEnvs = [farmwareEnv];
    render(<EnvEditor {...p} />);
    fireEvent.click(screen.getByTitle(/^delete$/i));
    expect(destroy).toHaveBeenCalledWith(farmwareEnv.uuid);
  });
});
