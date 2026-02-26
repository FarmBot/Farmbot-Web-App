let mockDestroyAllPromise: Promise<void> =
  Promise.reject("error").catch(() => { });

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ClearFarmwareData } from "../clear_farmware_data";
import { destroyAll } from "../../../api/crud";
import * as crud from "../../../api/crud";
import { success, error } from "../../../toast/toast";
import { ClearFarmwareDataProps } from "../interfaces";

let destroyAllSpy: jest.SpyInstance;

beforeEach(() => {
  destroyAllSpy = jest.spyOn(crud, "destroyAll")
    .mockImplementation(jest.fn(() => mockDestroyAllPromise) as never);
});

afterEach(() => {
  destroyAllSpy.mockRestore();
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
