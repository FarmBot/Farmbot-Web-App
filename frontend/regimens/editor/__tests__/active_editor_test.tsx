import React from "react";
import { render, act } from "@testing-library/react";
import { ActiveEditor } from "../active_editor";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { ActiveEditorProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { fakeVariableNameSet } from "../../../__test_support__/fake_variables";

describe("<ActiveEditor />", () => {
  const fakeProps = (): ActiveEditorProps => ({
    dispatch: jest.fn(),
    regimen: fakeRegimen(),
    calendar: [],
    resources: buildResourceIndex([]).index,
    variableData: {},
  });

  it("renders", () => {
    const { container } = render(<ActiveEditor {...fakeProps()} />);
    ["Variables", "Schedule item"].map(string =>
      expect(container.textContent).toContain(string));
  });

  it("toggles variable form state", () => {
    const ref = React.createRef<ActiveEditor>();
    render(<ActiveEditor ref={ref} {...fakeProps()} />);
    act(() => { ref.current?.toggleVarShow(); });
    expect(ref.current?.state).toEqual({ variablesCollapsed: true });
  });

  it("displays correct variable count", () => {
    const p = fakeProps();
    p.variableData = fakeVariableNameSet("foo");
    p.variableData["none"] = undefined;
    p.variableData["bar"] = {
      celeryNode: {
        kind: "parameter_declaration",
        args: {
          label: "foo",
          default_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
        }
      },
      dropdown: { label: "", value: "" },
      vector: { x: 0, y: 0, z: 0 },
    };
    const { container } = render(<ActiveEditor {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("variables (1)");
  });
});
