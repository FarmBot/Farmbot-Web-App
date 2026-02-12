const mockDevice = { execScript: jest.fn((_) => Promise.resolve({})) };

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { BasicFarmwarePage, BasicFarmwarePageProps } from "../basic_farmware_page";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import * as deviceModule from "../../device";

beforeEach(() => {
  jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});
describe("<BasicFarmwarePage />", () => {
  const fakeProps = (): BasicFarmwarePageProps => ({
    farmwareName: "My Farmware",
    farmware: fakeFarmware("My Farmware"),
    botOnline: true,
  });

  it("renders without inputs", () => {
    const { container } = render(<BasicFarmwarePage {...fakeProps()} />);
    expect(container.textContent).toContain("No inputs provided.");
  });

  it("runs Farmware", () => {
    const { container } = render(<BasicFarmwarePage {...fakeProps()} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(mockDevice.execScript).toHaveBeenCalledWith("My Farmware", []);
  });

  it("renders Farmware pending install", () => {
    const p = fakeProps();
    p.farmware && (p.farmware.installation_pending = true);
    const { container } = render(<BasicFarmwarePage {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("pending installation");
    expect(container.querySelector("button")).toBeDisabled();
  });
});
