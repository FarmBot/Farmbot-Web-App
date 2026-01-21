import React from "react";
import { render } from "@testing-library/react";
import { PlantImageInstances } from "../plants";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { convertPlants } from "../../../farm_designer/three_d_garden_map";

describe("<PlantImageInstances />", () => {
  const fakeProps = () => {
    const config = clone(INITIAL);
    const plant = fakePlant();
    const plants = convertPlants(config, [plant]);
    return { config, plants };
  };

  it("renders instanced plants", () => {
    const { config, plants } = fakeProps();
    const { container } = render(
      <PlantImageInstances
        plants={plants}
        config={config}
        getZ={() => 0}
        visible={true}
        animateSeasons={false}
        season={config.plants} />,
    );
    expect(container.querySelector("instancedmesh")).toBeTruthy();
  });

  it("renders nothing without plants", () => {
    const { config } = fakeProps();
    const { container } = render(
      <PlantImageInstances
        plants={[]}
        config={config}
        getZ={() => 0}
        visible={true}
        animateSeasons={false}
        season={config.plants} />,
    );
    expect(container.querySelector("instancedmesh")).toBeFalsy();
  });
});
