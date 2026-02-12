let mockDestroyAllPromise: Promise<void> =
  Promise.reject("error").catch(() => { });
jest.mock("../../../api/crud", () => ({
  destroyAll: jest.fn(() => mockDestroyAllPromise)
}));

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ClearFarmwareData } from "../clear_farmware_data";
import { destroyAll } from "../../../api/crud";
import { success, error } from "../../../toast/toast";
import { ClearFarmwareDataProps } from "../interfaces";

afterAll(() => {
  jest.unmock("../../../api/crud");
});
describe("<ClearFarmwareData />", () => {
  const fakeProps = (): ClearFarmwareDataProps => ({
    farmwareEnvs: [],
  });

  it("destroys all FarmwareEnvs", async () => {
    mockDestroyAllPromise = Promise.resolve();
    render(<ClearFarmwareData {...fakeProps()} />);
    fireEvent.click(screen.getByTitle(/delete all data/i));
    await waitFor(() => expect(destroyAll).toHaveBeenCalledWith(
      "FarmwareEnv", false, "Are you sure you want to delete all 0 values?"));
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith(expect.stringContaining("deleted")));
  });

  it("fails to destroy all FarmwareEnvs", async () => {
    mockDestroyAllPromise = Promise.reject("error");
    render(<ClearFarmwareData {...fakeProps()} />);
    fireEvent.click(screen.getByTitle(/delete all data/i));
    await waitFor(() => expect(destroyAll).toHaveBeenCalledWith(
      "FarmwareEnv", false, "Are you sure you want to delete all 0 values?"));
    await waitFor(() => expect(error).toHaveBeenCalled());
  });
});
