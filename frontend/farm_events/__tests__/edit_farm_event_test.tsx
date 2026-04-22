const mockSave = jest.fn();

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { RawEditFarmEvent as EditFarmEvent } from "../edit_farm_event";
import { AddEditFarmEventProps } from "../../farm_designer/interfaces";
import {
  fakeFarmEvent, fakeSequence,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { Path } from "../../internal_urls";
import * as crud from "../../api/crud";
import { success } from "../../toast/toast";
import { EditFEForm } from "../edit_fe_form";

let destroySpy: jest.SpyInstance;

describe("<EditFarmEvent />", () => {
  beforeEach(() => {
    mockSave.mockClear();
    destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  });

  function fakeProps(): AddEditFarmEventProps {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const farmEvent = fakeFarmEvent("Sequence", sequence.body.id);
    return {
      deviceTimezone: "",
      dispatch: jest.fn(() => Promise.resolve()),
      regimensById: {},
      sequencesById: { "1": sequence },
      farmEventsById: { "1": farmEvent },
      executableOptions: [],
      repeatOptions: [],
      handleTime: jest.fn(),
      farmEvents: [],
      getFarmEvent: _ => farmEvent,
      findFarmEventByUuid: () => farmEvent,
      findExecutable: () => sequence,
      timeSettings: fakeTimeSettings(),
      resources: buildResourceIndex([]).index,
    };
  }

  it("renders", () => {
    const { container } = render(<EditFarmEvent {...fakeProps()} />);
    ["Edit event", "Save"]
      .map(string => expect(container.textContent).toContain(string));
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.farmEvents("nope"));
    const p = fakeProps();
    const navigate = jest.fn();
    p.getFarmEvent = jest.fn(url => navigate(url));
    const { container } = render(<EditFarmEvent {...p} />);
    expect(container.textContent).toContain("Redirecting");
    expect(mockNavigate).toHaveBeenCalledWith(Path.farmEvents());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    p.getFarmEvent = jest.fn();
    const { container } = render(<EditFarmEvent {...p} />);
    expect(container.textContent).toContain("Redirecting");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("calls farm event save", () => {
    const formRef = { current: undefined as unknown as EditFEForm };
    const createRefSpy = jest.spyOn(React, "createRef")
      .mockReturnValue(formRef);
    const { container } = render(<EditFarmEvent {...fakeProps()} />);
    formRef.current.commitViewModel = mockSave;
    fireEvent.click(container.querySelector(".save-btn") as Element);
    expect(mockSave).toHaveBeenCalled();
    createRefSpy.mockRestore();
  });

  it("doesn't call farm event save if event is missing", () => {
    const p = fakeProps();
    p.getFarmEvent = () => undefined;
    location.pathname = Path.mock(Path.farmEvents("nope"));
    const { container } = render(<EditFarmEvent {...p} />);
    fireEvent.click(container.querySelector(".save-btn") as Element);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("deletes farm event", async () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const farmEvent = fakeFarmEvent("Sequence", sequence.body.id);
    p.getFarmEvent = () => farmEvent;
    const { container } = render(<EditFarmEvent {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    await waitFor(() => expect(destroySpy).toHaveBeenCalledWith(farmEvent.uuid));
    expect(destroySpy).toHaveBeenCalledWith(farmEvent.uuid);
    expect(mockNavigate).toHaveBeenCalledWith(Path.farmEvents());
    expect(success).toHaveBeenCalledWith("Deleted event.", { title: "Deleted" });
  });
});
