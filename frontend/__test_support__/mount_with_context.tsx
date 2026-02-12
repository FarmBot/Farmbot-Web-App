import React from "react";
import { render } from "@testing-library/react";

export const renderWithContext = (element: React.ReactElement) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { NavigationContext } =
    require("../routes_helpers") as typeof import("../routes_helpers");
  return render(
    <NavigationContext.Provider value={mockNavigate}>
      {element}
    </NavigationContext.Provider>,
  );
};
