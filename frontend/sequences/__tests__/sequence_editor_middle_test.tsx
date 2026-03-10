import React from "react";
import { SequenceEditorMiddle } from "../sequence_editor_middle";
import { render } from "@testing-library/react";
import { SequenceEditorMiddleProps } from "../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import {
  fakeHardwareFlags, fakeFarmwareData,
} from "../../__test_support__/fake_sequence_step_data";
import { emptyState } from "../../resources/reducer";

describe("<SequenceEditorMiddle/>", () => {
  function fakeProps(): SequenceEditorMiddleProps {
    return {
      dispatch: jest.fn(),
      sequence: fakeSequence(),
      sequences: [],
      resources: buildResourceIndex().index,
      syncStatus: "synced",
      hardwareFlags: fakeHardwareFlags(),
      farmwareData: fakeFarmwareData(),
      getWebAppConfigValue: jest.fn(),
      sequencesState: emptyState().consumers.sequences,
      visualized: undefined,
    };
  }

  it("active editor", () => {
    const { container } = render(<SequenceEditorMiddle {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("run");
  });

  it("inactive editor", () => {
    const p = fakeProps();
    p.sequence = undefined;
    const { container } = render(<SequenceEditorMiddle {...p} />);
    expect(container.textContent).toContain("No Sequence selected");
  });
});
