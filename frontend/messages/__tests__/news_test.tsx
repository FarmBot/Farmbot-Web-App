import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { News, truncate } from "../news";
import axios from "axios";

jest.mock("axios", () => ({ get: jest.fn() }));

const FAKE_FEED = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>1</id>
    <title>A</title>
    <link href="https://farm.bot/a" />
    <content type="html"><p>1</p><p>2</p><p>3</p><p>4</p></content>
  </entry>
</feed>`;

describe("FarmBot News", () => {
  it("renders posts", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: FAKE_FEED });
    render(<News />);
    await waitFor(() => expect(screen.getByText("FarmBot News"))); 
    expect(screen.getByText("A")).toBeVisible();
    expect(screen.getByText("Read more")).toBeVisible();
  });

  it("truncates html", () => {
    const html = "<p>a</p><p>b</p><p>c</p><p>d</p>";
    expect(truncate(html)).toEqual("<p>a</p><p>b</p><p>c</p>");
  });
});
