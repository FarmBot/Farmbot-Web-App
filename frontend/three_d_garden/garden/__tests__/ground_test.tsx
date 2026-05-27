import React from "react";
import { render } from "@testing-library/react";
import { useTexture } from "@react-three/drei";
import { Ground, GroundProps } from "../ground";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { ASSETS } from "../../constants";

describe("<Ground />", () => {
  beforeEach(() => {
    (useTexture as unknown as jest.Mock).mockClear();
  });

  const fakeProps = (): GroundProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<Ground {...fakeProps()} />);
    expect(container).toContainHTML("ground");
  });

  it.each<[string, string, string[]]>([
    [
      "Outdoor",
      ASSETS.textures.grass,
      [ASSETS.textures.concrete, ASSETS.textures.bricks],
    ],
    [
      "Lab",
      ASSETS.textures.concrete,
      [ASSETS.textures.grass, ASSETS.textures.bricks],
    ],
    [
      "Greenhouse",
      ASSETS.textures.bricks,
      [ASSETS.textures.grass, ASSETS.textures.concrete],
    ],
  ])("loads only the active %s ground texture",
    (scene, expectedTexture, skippedTextures) => {
      const p = fakeProps();
      p.config.scene = scene;
      render(<Ground {...p} />);
      const loadedTextures = (useTexture as unknown as jest.Mock).mock.calls
        .map(([url]) => url);
      expect(loadedTextures).toContain(expectedTexture);
      skippedTextures.forEach(texture =>
        expect(loadedTextures).not.toContain(texture));
    });
});
