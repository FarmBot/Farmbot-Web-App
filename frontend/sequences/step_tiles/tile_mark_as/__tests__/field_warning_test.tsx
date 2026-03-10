import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { CustomFieldWarning } from "../field_warning";
import { CustomFieldWarningProps } from "../interfaces";

describe("<CustomFieldWarning />", () => {
  const fakeProps = (): CustomFieldWarningProps => ({
    resource: { kind: "nothing", args: {} },
    field: "",
    update: jest.fn(),
  });

  it("doesn't display warning", () => {
    const p = fakeProps();
    p.field = "";
    const { container } = render(<CustomFieldWarning {...p} />);
    expect(container.textContent?.toLowerCase()).not.toContain("invalid property");
  });

  it("displays warning", () => {
    const p = fakeProps();
    p.field = "nope";
    const { container } = render(<CustomFieldWarning {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("invalid property");
    expect(container.textContent?.toLowerCase()).toContain("meta");
    const didYouMean = container.querySelector(".did-you-mean");
    if (!didYouMean) { throw new Error("Expected did-you-mean button"); }
    fireEvent.click(didYouMean);
    expect(p.update).toHaveBeenCalledWith({ field: "meta.nope" });
  });

  it("displays warning: Device resource", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource", args: { resource_type: "Device", resource_id: 1 }
    };
    p.field = "x";
    const { container } = render(<CustomFieldWarning {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("invalid property");
    expect(container.textContent?.toLowerCase()).not.toContain("meta");
  });

  it("displays warning: GenericPointer resource", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource", args: { resource_type: "GenericPointer", resource_id: 1 }
    };
    p.field = "openfarm_slug";
    const { container } = render(<CustomFieldWarning {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("invalid property");
    expect(container.textContent?.toLowerCase()).toContain("meta");
  });

  it("doesn't display warning: Plant resource", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource", args: { resource_type: "Plant", resource_id: 1 }
    };
    p.field = "openfarm_slug";
    const { container } = render(<CustomFieldWarning {...p} />);
    expect(container.textContent?.toLowerCase()).not.toContain("invalid property");
    expect(container.textContent?.toLowerCase()).not.toContain("meta");
  });

  it("displays warning: Weed resource", () => {
    const p = fakeProps();
    p.resource = {
      kind: "resource", args: { resource_type: "Weed", resource_id: 1 }
    };
    p.field = "openfarm_slug";
    const { container } = render(<CustomFieldWarning {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("invalid property");
    expect(container.textContent?.toLowerCase()).toContain("meta");
  });

  it("displays warning: identifier", () => {
    const p = fakeProps();
    p.resource = { kind: "identifier", args: { label: "var" } };
    p.field = "mounted_tool_id";
    const { container } = render(<CustomFieldWarning {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("invalid property");
    expect(container.textContent?.toLowerCase()).toContain("meta");
  });
});
