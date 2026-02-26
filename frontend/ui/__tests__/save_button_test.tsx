import React from "react";
import { render } from "@testing-library/react";
import { SaveBtn, SaveBtnProps } from "../save_button";
import { SpecialStatus } from "farmbot";
import * as I18n from "../../i18next_wrapper";

describe("<SaveBtn />", () => {
  beforeEach(() => {
    jest.spyOn(I18n, "t")
      .mockImplementation((input: string) => input);
  });

  const fakeProps = (): SaveBtnProps => ({
    status: SpecialStatus.SAVED,
    onClick: jest.fn(),
  });

  it.each<[SpecialStatus, string]>([
    [SpecialStatus.SAVED, "saved"],
    [SpecialStatus.DIRTY, "save"],
    [SpecialStatus.SAVING, "saving"],
  ])("returns button with status %s %s", (status, text) => {
    const p = fakeProps();
    p.status = status;
    const { container } = render(<SaveBtn {...p} />);
    expect(container.textContent?.toLowerCase()).toContain(text);
  });
});
