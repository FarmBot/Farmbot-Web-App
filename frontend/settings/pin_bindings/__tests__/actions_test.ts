import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakePinBinding, fakeSequence,
} from "../../../__test_support__/fake_state/resources";
import {
  PinBindingType, StandardPinBinding,
} from "farmbot/dist/resources/api_resources";
import * as crud from "../../../api/crud";
import { SetPinBindingProps, setPinBinding } from "../actions";
import { PinBindingListItems } from "../interfaces";
import { error } from "../../../toast/toast";

let overwriteSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let initSaveSpy: jest.SpyInstance;

beforeEach(() => {
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
});

afterEach(() => {
  overwriteSpy.mockRestore();
  saveSpy.mockRestore();
  destroySpy.mockRestore();
  initSaveSpy.mockRestore();
});

describe("setPinBinding()", () => {
  const fakeProps = (): SetPinBindingProps => {
    const pinBinding = fakePinBinding();
    pinBinding.body.pin_num = 20;
    pinBinding.body.binding_type = PinBindingType.standard;
    (pinBinding.body as StandardPinBinding).sequence_id = 1;
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.name = "my sequence";
    const resources = buildResourceIndex([sequence, pinBinding]).index;
    const binding: PinBindingListItems = {
      pin_number: pinBinding.body.pin_num,
      sequence_id: sequence.body.id,
      uuid: pinBinding.uuid,
      binding_type: PinBindingType.standard,
      special_action: undefined,
    };
    return {
      binding,
      dispatch: jest.fn(),
      resources,
      pinNumber: 20,
    };
  };

  it("un-binds pin", () => {
    const p = fakeProps();
    setPinBinding(p)({
      isNull: true, label: "", value: "",
    });
    expect(error).not.toHaveBeenCalled();
    expect(crud.initSave).not.toHaveBeenCalled();
    expect(crud.overwrite).not.toHaveBeenCalled();
    expect(crud.destroy).toHaveBeenCalled();
    expect(crud.save).not.toHaveBeenCalled();
  });

  it("re-binds pin: standard", () => {
    const p = fakeProps();
    setPinBinding(p)({
      headingId: PinBindingType.standard, label: "", value: 1,
    });
    expect(error).not.toHaveBeenCalled();
    expect(crud.destroy).not.toHaveBeenCalled();
    expect(crud.initSave).not.toHaveBeenCalled();
    expect(crud.overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({
        pin_num: 20, sequence_id: 1, binding_type: PinBindingType.standard,
        special_action: undefined,
      }));
    expect(crud.save).toHaveBeenCalled();
  });

  it("re-binds pin: special", () => {
    const p = fakeProps();
    setPinBinding(p)({
      headingId: PinBindingType.special, label: "", value: "sync",
    });
    expect(error).not.toHaveBeenCalled();
    expect(crud.destroy).not.toHaveBeenCalled();
    expect(crud.initSave).not.toHaveBeenCalled();
    expect(crud.overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({
        pin_num: 20, special_action: "sync", binding_type: PinBindingType.special,
        sequence_id: undefined,
      }));
    expect(crud.save).toHaveBeenCalled();
  });

  it("binds new pin", () => {
    const p = fakeProps();
    p.pinNumber = 5;
    p.binding = undefined;
    setPinBinding(p)({
      headingId: PinBindingType.special, label: "", value: "sync",
    });
    expect(error).not.toHaveBeenCalled();
    expect(crud.destroy).not.toHaveBeenCalled();
    expect(crud.overwrite).not.toHaveBeenCalled();
    expect(crud.initSave).toHaveBeenCalledWith("PinBinding", {
      pin_num: 5, special_action: "sync", binding_type: PinBindingType.special,
    });
  });
});
