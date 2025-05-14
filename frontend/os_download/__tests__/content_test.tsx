let mockIsMobile = false;
jest.mock("../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { OsDownloadPage } from "../content";

const text = (computer: string) =>
  `Your FarmBot's internal computer is the Raspberry Pi ${computer}`;

describe("<OsDownloadPage />", () => {
  it("renders", () => {
    globalConfig.rpi4_release_url = "fake rpi4 img url";
    globalConfig.rpi4_release_tag = "1.0.1";

    globalConfig.rpi_release_url = "fake rpi img url";
    globalConfig.rpi_release_tag = "1.0.0";

    render(<OsDownloadPage />);
    const btn = screen.getByText("Show all download links");
    fireEvent.click(btn);

    const rpi3Link = screen.getAllByRole("link")[0];
    expect(rpi3Link.textContent).toEqual("DOWNLOAD v1.0.1");
    expect(rpi3Link.getAttribute("href")).toEqual("fake rpi4 img url");

    const rpiLink = screen.getAllByRole("link")[1];
    expect(rpiLink.textContent).toEqual("DOWNLOAD v1.0.0");
    expect(rpiLink.getAttribute("href")).toEqual("fake rpi img url");
  });

  it("renders on small screens", () => {
    mockIsMobile = true;
    const { container } = render(<OsDownloadPage />);
    expect(container).toContainHTML("download");
  });

  it("renders on large screens", () => {
    mockIsMobile = false;
    const { container } = render(<OsDownloadPage />);
    expect(container).toContainHTML("download");
  });

  it("toggles the wizard", () => {
    const ALL = "Show all download links";
    const RETURN = "Return to the wizard";
    render(<OsDownloadPage />);
    expect(screen.getByText(ALL)).toBeInTheDocument();
    expect(screen.queryByText(RETURN)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(ALL));
    expect(screen.queryByText(ALL)).not.toBeInTheDocument();
    expect(screen.getByText(RETURN)).toBeInTheDocument();
    fireEvent.click(screen.getByText(RETURN));
    expect(screen.getByText(ALL)).toBeInTheDocument();
    expect(screen.queryByText(RETURN)).not.toBeInTheDocument();
  });

  it("runs the wizard: express", () => {
    render(<OsDownloadPage />);
    fireEvent.click(screen.getByText("Express"));
    fireEvent.click(screen.getByText("Express v1.0"));
    expect(screen.getByText(text("Zero W"))).toBeInTheDocument();
  });

  it("runs the wizard: genesis", () => {
    render(<OsDownloadPage />);
    fireEvent.click(screen.getByText("Genesis"));
    fireEvent.click(screen.getByText("Genesis v1.2"));
    expect(screen.getByText(text("3"))).toBeInTheDocument();
  });

  it("runs the wizard: genesis v1.6.0", () => {
    render(<OsDownloadPage />);
    fireEvent.click(screen.getByText("Genesis"));
    fireEvent.click(screen.getByText("Genesis v1.6"));
    fireEvent.click(screen.getByText("Black"));
    fireEvent.click(screen.getByText("Raspberry Pi Model 3"));
    expect(screen.getByText(text("3"))).toBeInTheDocument();
  });

  it("runs the wizard: genesis v1.6.1 & some v1.6.2", () => {
    render(<OsDownloadPage />);
    fireEvent.click(screen.getByText("Genesis"));
    fireEvent.click(screen.getByText("Genesis v1.6"));
    fireEvent.click(screen.getByText("White"));
    expect(screen.getByText(text("4"))).toBeInTheDocument();
  });

  it("runs the wizard: genesis other v1.6.2", () => {
    render(<OsDownloadPage />);
    fireEvent.click(screen.getByText("Genesis"));
    fireEvent.click(screen.getByText("Genesis v1.6"));
    fireEvent.click(screen.getByText("Black"));
    fireEvent.click(screen.getByText("Raspberry Pi Model 4"));
    expect(screen.getByText(text("4"))).toBeInTheDocument();
  });

  it("runs the wizard: genesis v1.7", () => {
    render(<OsDownloadPage />);
    fireEvent.click(screen.getByText("Genesis"));
    fireEvent.click(screen.getByText("Genesis v1.7"));
    expect(screen.getByText(text("4"))).toBeInTheDocument();
  });

  it("runs the wizard: genesis v1.8", () => {
    render(<OsDownloadPage />);
    fireEvent.click(screen.getByText("Genesis"));
    fireEvent.click(screen.getByText("Genesis v1.8"));
    expect(screen.getByText(text("4"))).toBeInTheDocument();
  });
});
