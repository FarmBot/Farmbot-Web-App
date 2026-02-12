import React from "react";
import {
  fireEvent, render, screen, waitFor,
} from "@testing-library/react";
import {
  Photos, MoveToLocation, PhotoButtons,
} from "../photos";
import { fakeImages } from "../../../__test_support__/fake_state/images";
import {
  PhotosProps, MoveToLocationProps, PhotoButtonsProps, PhotosComponentState,
} from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { success, error } from "../../../toast/toast";
import { Actions } from "../../../constants";
import {
  fakeImage, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { fakeDesignerState } from "../../../__test_support__/fake_designer_state";
import {
  fakeMovementState, fakePercentJob,
} from "../../../__test_support__/fake_bot_data";
import * as crud from "../../../api/crud";
import * as deviceActions from "../../../devices/actions";
import * as imageActions from "../actions";
import * as imageFlipper from "../image_flipper";
import { UUID } from "../../../resources/interfaces";

let destroySpy: jest.SpyInstance;
let moveSpy: jest.SpyInstance;
let setShownMapImagesSpy: jest.SpyInstance;
let selectNextImageSpy: jest.SpyInstance;

beforeEach(() => {
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  moveSpy = jest.spyOn(deviceActions, "move").mockImplementation(jest.fn());
  setShownMapImagesSpy = jest.spyOn(imageActions, "setShownMapImages")
    .mockImplementation(() => ({
      type: Actions.SET_SHOWN_MAP_IMAGES,
      payload: [],
    }));
  selectNextImageSpy = jest.spyOn(imageFlipper, "selectNextImage")
    .mockImplementation((images, index) => dispatch => {
      dispatch({
        type: Actions.SELECT_IMAGE,
        payload: images[index]?.uuid,
      });
      dispatch({
        type: Actions.SET_SHOWN_MAP_IMAGES,
        payload: [],
      });
    });
});

afterEach(() => {
  destroySpy.mockRestore();
  moveSpy.mockRestore();
  setShownMapImagesSpy.mockRestore();
  selectNextImageSpy.mockRestore();
});

describe("<Photos />", () => {
  const clonedImages = () => fakeImages.map(image => ({
    ...image,
    body: {
      ...image.body,
      meta: { ...image.body.meta },
    },
  }));

  const fakeProps = (): PhotosProps => ({
    images: [],
    currentImage: undefined,
    currentImageSize: { width: undefined, height: undefined },
    flags: fakeImageShowFlags(),
    dispatch: mockDispatch(),
    timeSettings: fakeTimeSettings(),
    imageJobs: [],
    botToMqttStatus: "up",
    syncStatus: "synced",
    env: {},
    designer: fakeDesignerState(),
    getConfigValue: jest.fn(),
    arduinoBusy: false,
    currentBotLocation: { x: 0, y: 0, z: 0 },
    movementState: fakeMovementState(),
  });

  const expectFlip = (uuid: UUID) => {
    expect(imageActions.selectImage).toHaveBeenCalledWith(uuid);
    expect(imageActions.setShownMapImages).toHaveBeenCalledWith(uuid);
  };

  const setStateSync = (instance: Photos) => {
    instance.setState = (update: Partial<PhotosComponentState>) => {
      instance.state = { ...instance.state, ...update };
    };
  };

  it("shows photo", () => {
    const p = fakeProps();
    const config = fakeWebAppConfig();
    config.body.show_images = true;
    config.body.photo_filter_begin = "";
    config.body.photo_filter_end = "";
    p.getConfigValue = jest.fn(key => config.body[key]);
    const images = clonedImages();
    p.currentImage = images[1];
    const { container } = render(<Photos {...p} />);
    expect(screen.getByText(/June 1st, 2017/)).toBeInTheDocument();
    expect(screen.getByText("(632, 347, 164)")).toBeInTheDocument();
    expect(container.querySelector(".fa-eye.green")).toBeTruthy();
  });

  it("shows photo not in map", () => {
    const p = fakeProps();
    const images = clonedImages();
    p.currentImage = images[1];
    p.currentImage.body.meta.z = 100;
    p.env["CAMERA_CALIBRATION_camera_z"] = "0";
    p.flags.zMatch = false;
    const { container } = render(<Photos {...p} />);
    expect(screen.getByText(/June 1st, 2017/)).toBeInTheDocument();
    expect(screen.getByText("(632, 347, 100)")).toBeInTheDocument();
    expect(container.querySelector(".fa-eye-slash.gray")).toBeTruthy();
  });

  it("no photos", () => {
    render(<Photos {...fakeProps()} />);
    expect(screen.getByText(/yet taken any photos/i)).toBeInTheDocument();
  });

  it("deletes photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve(undefined));
    const images = clonedImages();
    p.currentImage = images[1];
    const { container } = render(<Photos {...p} />);
    const button = container.querySelector(".fa-trash");
    expect(button).toBeTruthy();
    fireEvent.click(button as HTMLElement);
    expect(crud.destroy).toHaveBeenCalledWith(p.currentImage.uuid);
    await waitFor(() => expect(success).toHaveBeenCalled());
  });

  it("fails to delete photo", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn()
      .mockRejectedValueOnce("error")
      .mockResolvedValue(undefined);
    const images = clonedImages();
    p.currentImage = images[1];
    const { container } = render(<Photos {...p} />);
    const button = container.querySelector(".fa-trash");
    expect(button).toBeTruthy();
    fireEvent.click(button as HTMLElement);
    expect(crud.destroy).toHaveBeenCalledWith(p.currentImage.uuid);
    await waitFor(() => expect(error).toHaveBeenCalled());
  });

  it("no photos to delete", () => {
    const instance = new Photos(fakeProps());
    instance.deletePhoto();
    expect(crud.destroy).not.toHaveBeenCalled();
  });

  it("doesn't show image download progress", () => {
    const p = fakeProps();
    p.imageJobs = [fakePercentJob({ status: "complete" })];
    render(<Photos {...p} />);
    expect(screen.queryByText(/uploading/i)).toBeNull();
  });

  it("can't find meta field data", () => {
    const p = fakeProps();
    p.images = clonedImages();
    p.images[0].body.meta.x = undefined;
    p.currentImage = p.images[0];
    render(<Photos {...p} />);
    expect(screen.getByText(/\(---/)).toBeInTheDocument();
  });

  it("toggles state", () => {
    const instance = new Photos(fakeProps());
    setStateSync(instance);
    expect(instance.state.crop).toEqual(true);
    expect(instance.state.rotate).toEqual(true);
    expect(instance.state.fullscreen).toEqual(false);
    instance.toggleCrop();
    instance.toggleRotation();
    instance.toggleFullscreen();
    expect(instance.state.crop).toEqual(false);
    expect(instance.state.rotate).toEqual(false);
    expect(instance.state.fullscreen).toEqual(true);
  });

  it("unselects photos upon exit", () => {
    const p = fakeProps();
    const { unmount } = render(<Photos {...p} />);
    unmount();
    expect(setShownMapImagesSpy).toHaveBeenCalledWith(undefined);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SHOWN_MAP_IMAGES, payload: [],
    });
  });

  it("returns slider label", () => {
    const p = fakeProps();
    p.images = [fakeImage(), fakeImage(), fakeImage()];
    const instance = new Photos(p);
    expect(instance.renderLabel(0)).toEqual("oldest");
    expect(instance.renderLabel(1)).toEqual("");
    expect(instance.renderLabel(2)).toEqual("newest");
  });

  it("returns image index", () => {
    const p = fakeProps();
    const image1 = fakeImage();
    image1.uuid = "Image 1 UUID";
    p.images = [fakeImage(), image1, fakeImage()];
    const instance = new Photos(p);
    expect(instance.getImageIndex(image1)).toEqual(1);
    expect(instance.getImageIndex(undefined)).toEqual(2);
  });

  it("selects next image", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const image = fakeImage();
    image.uuid = "Image UUID";
    p.images = [image, fakeImage(), fakeImage()];
    const instance = new Photos(p);
    instance.onSliderChange(99);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_IMAGE, payload: image.uuid,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SHOWN_MAP_IMAGES, payload: [],
    });
  });
});

describe("<PhotoButtons />", () => {
  const fakeProps = (): PhotoButtonsProps => ({
    image: undefined,
    dispatch: jest.fn(),
    flags: fakeImageShowFlags(),
    size: { width: 0, height: 0 },
    deletePhoto: jest.fn(),
    toggleCrop: jest.fn(),
    toggleRotation: jest.fn(),
    toggleFullscreen: jest.fn(),
    canCrop: true,
    canTransform: true,
    imageUrl: undefined,
  });

  it("highlights map image", () => {
    const p = fakeProps();
    p.image = fakeImage();
    p.image.body.id = 1;
    const { container } = render(<PhotoButtons {...p} />);
    const icon = container.querySelector("i.fa-eye");
    fireEvent.mouseEnter(icon as HTMLElement);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: 1,
    });
    fireEvent.mouseLeave(icon as HTMLElement);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HIGHLIGHT_MAP_IMAGE, payload: undefined,
    });
  });

  it("toggles rotation", () => {
    const p = fakeProps();
    p.imageUrl = "fake url";
    const { container } = render(<PhotoButtons {...p} />);
    fireEvent.click(container.querySelector(".fa-repeat") as HTMLElement);
    expect(p.toggleRotation).toHaveBeenCalled();
  });
});

describe("<MoveToLocation />", () => {
  const fakeProps = (): MoveToLocationProps => ({
    imageLocation: { x: 0, y: 0, z: 0 },
    botOnline: true,
    arduinoBusy: false,
    currentBotLocation: { x: 0, y: 0, z: 0 },
    dispatch: jest.fn(),
    defaultAxes: "XY",
    movementState: fakeMovementState(),
  });

  it("moves to location", () => {
    render(<MoveToLocation {...fakeProps()} />);
    fireEvent.click(screen.getByText(/go \(x, y\)/i));
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 0, y: 0, z: 0 });
  });

  it("handles missing location", () => {
    const p = fakeProps();
    p.imageLocation.x = undefined;
    const { container } = render(<MoveToLocation {...p} />);
    expect(container.innerHTML).toEqual("<div></div>");
  });
});
