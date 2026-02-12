import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Apology } from "../apology";
import { Session } from "../session";

describe("<Apology />", () => {
  let clearSpy: jest.SpyInstance;

  beforeEach(() => {
    clearSpy = jest.spyOn(Session, "clear").mockImplementation(jest.fn());
  });

  afterEach(() => {
    clearSpy.mockRestore();
  });

  it("clears session", () => {
    render(<Apology />);
    fireEvent.click(screen.getByText("Restart the app by clicking here."));
    expect(Session.clear).toHaveBeenCalled();
  });
});
