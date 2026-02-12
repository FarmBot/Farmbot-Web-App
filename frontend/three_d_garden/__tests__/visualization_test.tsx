import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { store } from "../../redux/store";
let mockResources = buildResourceIndex([]);

import React from "react";
import { render, screen } from "@testing-library/react";
import { Visualization, VisualizationProps } from "../visualization";
import { INITIAL } from "../config";
import { clone } from "lodash";
import {
  fakeFbosConfig, fakeFirmwareConfig, fakeSequence,
  fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { findSequence } from "../../resources/selectors_by_kind";

let originalGetState: typeof store.getState;

describe("<Visualization />", () => {
  beforeEach(() => {
    originalGetState = store.getState;
    (store as unknown as { getState: () => { resources: typeof mockResources } })
      .getState = () => ({ resources: mockResources });
  });

  afterEach(() => {
    (store as unknown as { getState: typeof store.getState }).getState =
      originalGetState;
  });

  const fakeProps = (): VisualizationProps => ({
    config: clone(INITIAL),
    visualizedSequenceUUID: undefined,
  });

  it("doesn't render: no uuid", () => {
    render(<Visualization {...fakeProps()} />);
    expect(screen.queryByText("visualization")).toBeNull();
  });

  it("doesn't render: no sequence id", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = undefined;
    mockResources = buildResourceIndex([sequence]);
    p.visualizedSequenceUUID =
      findSequence(mockResources.index, sequence.uuid)?.uuid;
    render(<Visualization {...p} />);
    expect(screen.queryByText("visualization")).toBeNull();
  });

  it("renders first point", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 1;
    mockResources = buildResourceIndex([sequence]);
    p.visualizedSequenceUUID =
      findSequence(mockResources.index, sequence.uuid)?.uuid;
    render(<Visualization {...p} />);
    expect(screen.getByText("visualization")).toBeInTheDocument();
  });

  it("renders: with sequence id and points", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.body = [
      {
        kind: "move_absolute",
        args: {
          location: { kind: "coordinate", args: { x: 100, y: 100, z: 0 } },
          offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
          speed: 100,
        },
      },
    ];
    mockResources = buildResourceIndex([
      sequence, fakeFbosConfig(), fakeFirmwareConfig(), fakeWebAppConfig(),
    ]);
    p.visualizedSequenceUUID =
      findSequence(mockResources.index, sequence.uuid)?.uuid;
    render(<Visualization {...p} />);
    expect(screen.getByText("visualization")).toBeInTheDocument();
  });
});
