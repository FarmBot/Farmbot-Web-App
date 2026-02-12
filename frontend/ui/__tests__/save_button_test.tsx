import React from "react";
import { render } from "@testing-library/react";
import { SaveBtn, SaveBtnProps } from "../save_button";
import { SpecialStatus } from "farmbot";

describe("<SaveBtn />", () => {
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
