import { ImageWorkspace } from "../image_workspace";

describe("<Body/>", () => {
  function fakeProps() {
    return {
      onFlip: jest.fn(),
      onProcessPhoto: jest.fn(),
      onChange: jest.fn(),
      currentImage: undefined,
      images: [],
      iteration: 9,
      morph: 9,
      blur: 9,
      H_LO: 2,
      S_LO: 4,
      V_LO: 6,
      H_HI: 8,
      S_HI: 10,
      V_HI: 12
    };
  }

  it("triggers onChange() event", () => {
    jest.clearAllMocks();
    const props = fakeProps();
    const iw = new ImageWorkspace(props);
    iw.props = props;
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
    jest.clearAllMocks();
    const props = fakeProps();
    const iw = new ImageWorkspace(props);
    const trigger = iw.numericChange("blur");
    const currentTarget: Partial<HTMLInputElement> = { value: "23" };
    type PartialEv = Partial<React.SyntheticEvent<HTMLInputElement>>;
    const e: PartialEv = { currentTarget: (currentTarget as HTMLInputElement) };
    trigger(e as React.SyntheticEvent<HTMLInputElement>);
    expect(props.onChange).toHaveBeenCalledWith("blur", 23);
  });
});
