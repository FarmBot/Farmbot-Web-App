import React from "react";
import { render } from "@testing-library/react";
import { useTexture } from "@react-three/drei";
import { UtilitiesPost, UtilitiesPostProps } from "../utilities_post";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("<UtilitiesPost />", () => {
  const fakeProps = (): UtilitiesPostProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const { container } = render(<UtilitiesPost {...fakeProps()} />);
    expect(container.innerHTML).toContain("utilities-post");
  });

  it("doesn't load hidden utilities", () => {
    const useTextureMock = useTexture as unknown as jest.Mock;
    useTextureMock.mockClear();
    const p = fakeProps();
    p.config.utilitiesPost = false;
    const { container } = render(<UtilitiesPost {...p} />);
    expect(container.innerHTML).not.toContain("utilities-post");
    expect(useTextureMock).not.toHaveBeenCalled();
  });
});
