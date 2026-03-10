let mockDev = false;
import { fakeState } from "../../__test_support__/fake_state";
import { store } from "../../redux/store";
const mockState = fakeState();

import React from "react";
import {
  fireEvent, render, screen, waitFor,
} from "@testing-library/react";
import { Feedback, SupportPanel } from "../support";
import axios from "axios";
import { DevSettings } from "../../settings/dev/dev_support";
import { success } from "../../toast/toast";
import { API } from "../../api";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { Path } from "../../internal_urls";
import * as ui from "../../ui";

let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;
let futureFeaturesEnabledSpy: jest.SpyInstance;
let axiosPostSpy: jest.SpyInstance;
let helpSpy: jest.SpyInstance;

beforeEach(() => {
  originalGetState = store.getState;
  originalDispatch = store.dispatch;
  futureFeaturesEnabledSpy = jest.spyOn(DevSettings, "futureFeaturesEnabled")
    .mockImplementation(() => mockDev);
  axiosPostSpy = jest.spyOn(axios, "post").mockImplementation(() => Promise.resolve({}));
  helpSpy = jest.spyOn(ui, "Help")
    .mockImplementation((props: { links?: React.ReactNode[] }) =>
      <div data-testid={"help-links"}>{props.links}</div>);
  (store as unknown as { getState: () => typeof mockState }).getState =
    () => mockState;
  (store as unknown as { dispatch: jest.Mock }).dispatch = jest.fn();
});

afterEach(() => {
  mockDev = false;
  futureFeaturesEnabledSpy.mockRestore();
  axiosPostSpy.mockRestore();
  helpSpy.mockRestore();
  (store as unknown as { getState: typeof store.getState }).getState =
    originalGetState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
    originalDispatch;
});

describe("<SupportPanel />", () => {
  it("renders", () => {
    const { container } = render(<SupportPanel />);
    expect(container.textContent?.toLowerCase()).toContain("support staff");
    expect(container.textContent?.toLowerCase()).not.toContain("priority");
  });

  it("renders priority support", () => {
    mockDev = true;
    const { container } = render(<SupportPanel />);
    expect(container.textContent?.toLowerCase()).toContain("priority");
  });
});

describe("<Feedback />", () => {
  it("sends feedback", async () => {
    API.setBaseUrl("");
    const device = fakeDevice();
    device.body.fb_order_number = "FB1234";
    mockState.resources = buildResourceIndex([device]);
    const { container } = render(<Feedback />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "abc" }
    });
    fireEvent.click(screen.getByRole("button", { name: "submit" }));
    await waitFor(() => {
      expect((container.querySelector("textarea") as HTMLTextAreaElement).value)
        .toEqual("");
    });
    expect(axiosPostSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/feedback"),
      { message: "abc", slug: undefined },
    );
    expect(success).toHaveBeenCalledWith("Feedback sent.");
    expect(container.querySelector("button")?.className).toContain("green");
    expect((container.querySelector("textarea") as HTMLTextAreaElement).value)
      .toEqual("");
  });

  it("sends but keeps feedback", async () => {
    API.setBaseUrl("");
    const device = fakeDevice();
    device.body.fb_order_number = "FB1234";
    mockState.resources = buildResourceIndex([device]);
    const { container } = render(<Feedback keep={true} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "abc" }
    });
    fireEvent.click(screen.getByRole("button", { name: "submit" }));
    await waitFor(() => {
      expect(container.querySelector("button")?.className).toContain("gray");
    });
    expect(axiosPostSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/feedback"),
      { message: "abc", slug: undefined },
    );
    expect(success).toHaveBeenCalledWith("Feedback sent.");
    expect(container.querySelector("button")?.className).toContain("gray");
    expect((container.querySelector("textarea") as HTMLTextAreaElement).value)
      .toEqual("abc");
    fireEvent.click(screen.getByRole("button", { name: "submitted" }));
    expect(success).toHaveBeenCalledWith("Feedback already sent.");
  });

  it("navigates to order number input", () => {
    mockState.resources = buildResourceIndex([]);
    render(<Feedback keep={true} />);
    fireEvent.click(screen.getByText(/Register your ORDER NUMBER/));
    expect(mockNavigate)
      .toHaveBeenCalledWith(Path.settings("order_number"));
  });
});
