let mockPhotoOutcome = Promise.resolve();

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { TakePhotoButtonProps } from "../interfaces";
import { TakePhotoButton } from "../take_photo_button";
import * as deviceActions from "../../../devices/actions";
import { Content, ToolTips } from "../../../constants";
import { error } from "../../../toast/toast";
import { fakePercentJob } from "../../../__test_support__/fake_bot_data";
import { fakeLog } from "../../../__test_support__/fake_state/resources";

describe("<TakePhotoButton />", () => {
  let takePhotoSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPhotoOutcome = Promise.resolve();
    takePhotoSpy =
      jest.spyOn(deviceActions, "takePhoto")
        .mockImplementation(() => mockPhotoOutcome);
  });

  afterEach(() => {
    try {
      jest.runOnlyPendingTimers();
    } catch { /* noop */ }
    jest.useRealTimers();
    takePhotoSpy.mockRestore();
  });

  const fakeProps = (): TakePhotoButtonProps => ({
    env: {},
    botOnline: true,
    imageJobs: [],
    logs: [],
  });

  it("takes photo", () => {
    jest.useFakeTimers();
    const { container } = render(<TakePhotoButton {...fakeProps()} />);
    const cameraBtn = container.querySelector("button");
    expect(cameraBtn?.title).not.toEqual(Content.NO_CAMERA_SELECTED);
    cameraBtn && fireEvent.click(cameraBtn);
    jest.runAllTimers();
    expect(deviceActions.takePhoto).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("error taking photo", () => {
    mockPhotoOutcome = Promise.reject().catch(() => undefined);
    const { container } = render(<TakePhotoButton {...fakeProps()} />);
    const button = container.querySelector("button");
    button && fireEvent.click(button);
    expect(deviceActions.takePhoto).toHaveBeenCalled();
  });

  it("shows camera as disabled", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    const { container } = render(<TakePhotoButton {...p} />);
    const cameraBtn = container.querySelector("button");
    expect(cameraBtn?.title).toEqual(Content.NO_CAMERA_SELECTED);
    cameraBtn && fireEvent.click(cameraBtn);
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, { title: Content.NO_CAMERA_SELECTED });
    expect(deviceActions.takePhoto).not.toHaveBeenCalled();
  });

  it("shows as offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    const { container } = render(<TakePhotoButton {...p} />);
    const cameraBtn = container.querySelector("button");
    expect(cameraBtn?.classList.contains("pseudo-disabled")).toBeTruthy();
    expect(cameraBtn?.title).toEqual("FarmBot is offline");
  });

  it("shows as taken", () => {
    const p = fakeProps();
    const job = fakePercentJob();
    const now = new Date().getTime() / 1000;
    job.updated_at = now + 5;
    p.imageJobs = [job];
    const log = fakeLog();
    log.body.created_at = now + 5;
    log.body.message = "Taking photo";
    p.logs = [log];
    const { container } = render(<TakePhotoButton {...p} />);
    const cameraBtn = container.querySelector("button");
    cameraBtn && fireEvent.click(cameraBtn);
    expect(cameraBtn?.textContent).toEqual("100%");
  });
});
