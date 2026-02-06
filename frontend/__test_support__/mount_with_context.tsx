import React from "react";
import { mount } from "enzyme";

export const mountWithContext = (element: React.ReactElement) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { NavigationContext } =
    require("../routes_helpers") as typeof import("../routes_helpers");
  return mount<React.ReactElement>(
    <NavigationContext.Provider value={mockNavigate}>
      {element}
    </NavigationContext.Provider>,
  );
};
