import { ImageWorkspace, ImageWorkspaceProps } from "../image_workspace";
import { fakeImage } from "../../../__test_support__/fake_state/resources";
import { TaggedImage } from "farmbot";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("<Body/>", () => {
  const fakeProps = (): ImageWorkspaceProps => ({
    onFlip: jest.fn(),
    onProcessPhoto: jest.fn(),
    onChange: jest.fn(),
    currentImage: undefined as TaggedImage | undefined,
    images: [] as TaggedImage[],
    iteration: 9,
    morph: 9,
    blur: 9,
    H_LO: 2,
    S_LO: 4,
    V_LO: 6,
    H_HI: 8,
    S_HI: 10,
    V_HI: 12,
    botOnline: true,
    timeSettings: fakeTimeSettings(),
  });

  it("triggers onChange() event", () => {
    const props = fakeProps();
    const iw = new ImageWorkspace(props);
    // tslint:disable-next-line:no-any
    (iw as any).props = props;
    iw.onHslChange("H")([4, 5]);
    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenCalledWith("H_HI", 5);
    expect(props.onChange).toHaveBeenCalledWith("H_LO", 4);
    jest.clearAllMocks();
    iw.onHslChange("H")([2, 5]);
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith("H_HI", 5);
    jest.clearAllMocks();
    iw.onHslChange("H")([4, 8]);
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledWith("H_LO", 4);
    jest.clearAllMocks();
    iw.onHslChange("H")([2, 8]);
    expect(props.onChange).not.toHaveBeenCalled();
  });

  it("triggers numericChange()", () => {
    const props = fakeProps();
    const iw = new ImageWorkspace(props);
    const trigger = iw.numericChange("blur");
    const currentTarget: Partial<HTMLInputElement> = { value: "23" };
    type PartialEv = Partial<React.SyntheticEvent<HTMLInputElement>>;
    const e: PartialEv = { currentTarget: (currentTarget as HTMLInputElement) };
    trigger(e as React.SyntheticEvent<HTMLInputElement>);
    expect(props.onChange).toHaveBeenCalledWith("blur", 23);
  });

  it("doesn't process photo", () => {
    const p = fakeProps();
    const iw = new ImageWorkspace(p);
    iw.maybeProcessPhoto();
    expect(p.onProcessPhoto).not.toHaveBeenCalled();
  });

  it("processes first photo", () => {
    const p = fakeProps();
    const photo = fakeImage();
    p.images = [photo];
    const iw = new ImageWorkspace(p);
    iw.maybeProcessPhoto();
    expect(p.onProcessPhoto).toHaveBeenCalledWith(photo.body.id);
  });

  it("processes selected photo", () => {
    const p = fakeProps();
    const photo1 = fakeImage();
    photo1.body.id = 1;
    const photo2 = fakeImage();
    photo2.body.id = 2;
    p.images = [photo1, photo2];
    p.currentImage = photo2;
    const iw = new ImageWorkspace(p);
    iw.maybeProcessPhoto();
    expect(p.onProcessPhoto).toHaveBeenCalledWith(photo2.body.id);
  });
});
