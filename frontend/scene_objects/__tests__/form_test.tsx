import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { SceneObjectFormFields, SceneObjectFormValues } from "../form";
import * as ui from "../../ui";
import { type FBSelectProps } from "../../ui";
import { fakeSceneObject } from "../../__test_support__/fake_state/resources";
import { DevSettings } from "../../settings/dev/dev_support";

describe("<SceneObjectFormFields />", () => {
  const values = (): SceneObjectFormValues => fakeSceneObject({
    color: "#434343",
    x_center: 60,
    y_center: 110,
    z_base: 30,
    y_size: 200,
    z_size: 300,
  }).body;

  const commitInput = (input: Element, value: string) => {
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input, { target: { value } });
  };

  it("edits derived size fields", () => {
    const onValueChange = jest.fn();
    const onFocusChange = jest.fn();
    const { container } = render(<SceneObjectFormFields
      values={values()}
      onFocusChange={onFocusChange}
      onValueChange={onValueChange} />);

    const sizeInputs = [
      container.querySelector("input[name='x_size']"),
      container.querySelector("input[name='y_size']"),
      container.querySelector("input[name='z_size']"),
    ] as HTMLInputElement[];

    expect(sizeInputs[0]).toHaveValue(100);
    expect(sizeInputs[1]).toHaveValue(200);
    expect(sizeInputs[2]).toHaveValue(300);

    fireEvent.focus(sizeInputs[0]);
    fireEvent.change(sizeInputs[0], { target: { value: "150" } });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.blur(sizeInputs[0], { target: { value: "150" } });
    commitInput(sizeInputs[1], "250");
    commitInput(sizeInputs[2], "350");

    expect(onValueChange).toHaveBeenCalledWith("x_size", 150);
    expect(onValueChange).toHaveBeenCalledWith("y_size", 250);
    expect(onValueChange).toHaveBeenCalledWith("z_size", 350);
    expect(onFocusChange).toHaveBeenCalledWith("x_size");
    expect(onFocusChange).toHaveBeenCalledWith(undefined);
  });

  it("edits derived center fields", () => {
    const onValueChange = jest.fn();
    const { container } = render(<SceneObjectFormFields
      values={values()}
      onValueChange={onValueChange} />);

    const centerInputs = [
      container.querySelector("input[name='x_center']"),
      container.querySelector("input[name='y_center']"),
      container.querySelector("input[name='z_base']"),
    ] as HTMLInputElement[];

    expect(centerInputs[0]).toHaveValue(60);
    expect(centerInputs[1]).toHaveValue(110);
    expect(centerInputs[2]).toHaveValue(30);

    commitInput(centerInputs[0], "80");
    commitInput(centerInputs[1], "130");
    commitInput(centerInputs[2], "200");

    expect(onValueChange).toHaveBeenCalledWith("x_center", 80);
    expect(onValueChange).toHaveBeenCalledWith("y_center", 130);
    expect(onValueChange).toHaveBeenCalledWith("z_base", 200);
  });

  it("resets center coordinates", () => {
    const onValueChange = jest.fn();
    const { getAllByTitle } = render(<SceneObjectFormFields
      values={values()}
      onValueChange={onValueChange} />);

    getAllByTitle("Reset").forEach(button => fireEvent.click(button));

    expect(onValueChange).toHaveBeenCalledWith("x_center", 0);
    expect(onValueChange).toHaveBeenCalledWith("y_center", 0);
    expect(onValueChange).toHaveBeenCalledWith("z_base", 0);
  });

  it("groups coordinate fields", () => {
    const { container } = render(<SceneObjectFormFields
      values={values()}
      onValueChange={jest.fn()} />);

    expect(container.querySelectorAll(".info-box").length).toEqual(3);
    expect(container).toContainHTML("Center");
    expect(container).toContainHTML("Size");
    const fieldGroups = container.querySelectorAll(".plant-info-field-data");
    expect(fieldGroups[0]).toHaveClass("grid");
    expect(fieldGroups[0]).not.toHaveClass("row");
    expect(fieldGroups[1]).toHaveClass("row", "grid-3-col");
  });

  it("highlights the focused field", () => {
    const { container } = render(<SceneObjectFormFields
      values={values()}
      focusedField={"x_size"}
      onValueChange={jest.fn()} />);

    const highlighted = container.querySelector(".scene-object-field-highlight");

    expect(highlighted).toEqual(
      container.querySelector("input[name='x_size']"));
  });

  it("only shows texture for primitive shapes", () => {
    const { container, rerender } = render(<SceneObjectFormFields
      values={{ ...values(), shape: "box" }}
      onValueChange={jest.fn()} />);

    expect(container).toContainHTML("Texture");

    rerender(<SceneObjectFormFields
      values={{ ...values(), shape: "plant" }}
      onValueChange={jest.fn()} />);
    expect(container).not.toContainHTML("Texture");

    rerender(<SceneObjectFormFields
      values={{ ...values(), shape: "tray" }}
      onValueChange={jest.fn()} />);
    expect(container).not.toContainHTML("Texture");
  });

  it("edits color", () => {
    const onValueChange = jest.fn();
    const { container } = render(<SceneObjectFormFields
      values={{ ...values(), texture: "none" }}
      onValueChange={onValueChange} />);

    const colorInput = container
      .querySelector("input[name='color']");

    expect(container).toContainHTML("Color");
    fireEvent.change(colorInput as HTMLInputElement, {
      target: { value: "#999999" },
    });

    expect(onValueChange).toHaveBeenCalledWith("color", "#999999");
  });

  it("toggles scene object visibility", () => {
    const onValueChange = jest.fn();
    const { getByLabelText } = render(<SceneObjectFormFields
      values={{ ...values(), show: true }}
      onValueChange={onValueChange} />);

    fireEvent.click(getByLabelText("Show"));

    expect(onValueChange).toHaveBeenCalledWith("show", false);
  });

  it("falls back to a valid color input value", () => {
    const { container } = render(<SceneObjectFormFields
      values={{ ...values(), color: "not a color" }}
      onValueChange={jest.fn()} />);

    expect(container.querySelector("input[name='color']"))
      .toHaveValue("#434343");
  });

  it("doesn't include a dedicated name field", () => {
    const { container } = render(<SceneObjectFormFields
      values={values()}
      onValueChange={jest.fn()} />);

    expect(container.querySelector("input[name='sceneObjectName']"))
      .toBeFalsy();
  });

  it("edits select fields", () => {
    const futureFeaturesEnabled =
      jest.spyOn(DevSettings, "futureFeaturesEnabled")
        .mockReturnValue(false);
    const onValueChange = jest.fn();
    const fbSelectProps: FBSelectProps[] = [];
    const fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation(((props: FBSelectProps) => {
        fbSelectProps.push(props);
        return <div />;
      }) as never);

    render(<SceneObjectFormFields
      values={{ ...values(), shape: "mystery", texture: "mystery" }}
      onValueChange={onValueChange} />);

    expect(fbSelectProps[0].selectedItem?.value).toEqual("box");
    expect(fbSelectProps[0].list.map(item => item.value)).toContain("solar");
    expect(fbSelectProps[0].list.map(item => item.value)).toContain("tree");
    expect(fbSelectProps[0].list.map(item => item.value)).toContain("fence");
    expect(fbSelectProps[0].list.map(item => item.value))
      .not.toEqual(expect.arrayContaining(["astronaut", "hab", "rover"]));
    fbSelectProps[0].onChange({ label: "Sphere", value: "sphere" });
    fbSelectProps[1].onChange({ label: "max", value: "max" });
    fbSelectProps[2].onChange({ label: "world", value: "world" });

    expect(onValueChange).toHaveBeenCalledWith("shape", "sphere");
    expect(onValueChange).toHaveBeenCalledWith("x_origin", "max");
    expect(onValueChange).toHaveBeenCalledWith("y_origin", "world");
    fbSelectSpy.mockRestore();
    futureFeaturesEnabled.mockRestore();
  });

  it("shows future shape choices", () => {
    const futureFeaturesEnabled =
      jest.spyOn(DevSettings, "futureFeaturesEnabled")
        .mockReturnValue(true);
    const fbSelectProps: FBSelectProps[] = [];
    const fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation(((props: FBSelectProps) => {
        fbSelectProps.push(props);
        return <div />;
      }) as never);

    render(<SceneObjectFormFields
      values={values()}
      onValueChange={jest.fn()} />);

    expect(fbSelectProps[0].list.map(item => item.value))
      .toEqual(expect.arrayContaining(["astronaut", "hab", "rover"]));
    fbSelectSpy.mockRestore();
    futureFeaturesEnabled.mockRestore();
  });

  it("edits texture fields", () => {
    const onValueChange = jest.fn();
    const fbSelectProps: FBSelectProps[] = [];
    const fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation(((props: FBSelectProps) => {
        fbSelectProps.push(props);
        return <div />;
      }) as never);

    render(<SceneObjectFormFields
      values={{ ...values(), shape: "box", texture: "mystery" }}
      onValueChange={onValueChange} />);

    fbSelectProps[1].onChange({ label: "wood", value: "wood" });

    expect(fbSelectProps[1].selectedItem?.value).not.toEqual("mystery");
    expect(onValueChange).toHaveBeenCalledWith("texture", "wood");
    fbSelectSpy.mockRestore();
  });

  it("edits unified cube size", () => {
    const onValueChange = jest.fn();
    const onUnifiedSizeChange = jest.fn();
    const { container, getByLabelText, rerender } = render(<SceneObjectFormFields
      values={values()}
      onUnifiedSizeChange={onUnifiedSizeChange}
      onValueChange={onValueChange} />);
    const cube = getByLabelText("Cube");

    fireEvent.click(cube);

    expect(onUnifiedSizeChange).toHaveBeenCalledWith(true);
    expect(onValueChange).toHaveBeenCalledWith("y_size", 100);
    expect(onValueChange).toHaveBeenCalledWith("z_size", 100);
    rerender(<SceneObjectFormFields
      values={values()}
      showUnifiedSize={true}
      onUnifiedSizeChange={onUnifiedSizeChange}
      onValueChange={onValueChange} />);

    const sizeInput = container.querySelector("input[name='size']")!;
    commitInput(sizeInput, "123.4");

    expect(onValueChange).toHaveBeenCalledWith("x_size", 123.4);
    expect(onValueChange).toHaveBeenCalledWith("y_size", 123.4);
    expect(onValueChange).toHaveBeenCalledWith("z_size", 123.4);
  });

  it("edits preserved placement axes when shown", () => {
    const onPreserveAxesChange = jest.fn();
    const { container, getByLabelText, queryByLabelText, rerender } = render(
      <SceneObjectFormFields
        values={{ ...values(), preserve_axes: ["x"] }}
        showPreserveAxes={true}
        onPreserveAxesChange={onPreserveAxesChange}
        onValueChange={jest.fn()} />,
    );

    expect(getByLabelText("Fixed X")).toBeChecked();
    expect(getByLabelText("Fixed Y")).not.toBeChecked();
    expect(getByLabelText("Fixed Z")).not.toBeChecked();
    expect(container.querySelector("input[name='x_size']")).toBeDisabled();
    expect(container.querySelector("input[name='y_size']"))
      .not.toBeDisabled();
    fireEvent.click(getByLabelText("Fixed X"));
    fireEvent.click(getByLabelText("Fixed Y"));
    expect(onPreserveAxesChange).toHaveBeenNthCalledWith(1, []);
    expect(onPreserveAxesChange).toHaveBeenNthCalledWith(2, ["x", "y"]);

    rerender(<SceneObjectFormFields
      values={values()}
      onValueChange={jest.fn()} />);
    expect(queryByLabelText("Fixed X")).not.toBeInTheDocument();

    rerender(<SceneObjectFormFields
      values={values()}
      showPreserveAxes={true}
      showUnifiedSize={true}
      onValueChange={jest.fn()} />);
    expect(queryByLabelText("Fixed X")).not.toBeInTheDocument();
  });

  it("swaps X and Y sizes", () => {
    const onValueChange = jest.fn();
    const onPreserveAxesChange = jest.fn();
    const { getByRole } = render(<SceneObjectFormFields
      values={{ ...values(), preserve_axes: ["x", "z"] }}
      onPreserveAxesChange={onPreserveAxesChange}
      onValueChange={onValueChange} />);

    fireEvent.click(getByRole("button", { name: "Swap X & Y" }));

    expect(onValueChange).toHaveBeenNthCalledWith(1, "x_size", 200);
    expect(onValueChange).toHaveBeenNthCalledWith(2, "y_size", 100);
    expect(onPreserveAxesChange).toHaveBeenCalledWith(["y", "z"]);
  });

  it("collapses center and size sections", () => {
    const { container, getByRole } = render(<SceneObjectFormFields
      values={values()}
      onValueChange={jest.fn()} />);
    const centerToggle = getByRole("button", { name: "Center" });
    const sizeToggle = getByRole("button", { name: "Size" });

    fireEvent.click(centerToggle);
    expect(centerToggle).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector("input[name='x_center']"))
      .not.toBeInTheDocument();
    expect(container.querySelector("input[name='x_size']"))
      .toBeInTheDocument();

    fireEvent.click(sizeToggle);
    expect(sizeToggle).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector("input[name='x_size']"))
      .not.toBeInTheDocument();
  });
});
