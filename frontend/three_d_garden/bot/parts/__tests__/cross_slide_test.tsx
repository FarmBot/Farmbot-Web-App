import React from "react";
import { render } from "@testing-library/react";
import { CrossSlideFull, CrossSlide } from "../cross_slide";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<CrossSlide />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.crossSlide) as CrossSlideFull;
    const Component = CrossSlide(model);
    const { container } = render(<Component name={"name"} />);
    expect(container.innerHTML).toContain("name");
    expect(container.innerHTML).toContain("instancedmesh");
  });
});
