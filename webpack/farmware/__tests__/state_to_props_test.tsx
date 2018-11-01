import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";

describe("mapStateToProps()", () => {

  it("sync status unknown", () => {
    const props = mapStateToProps(fakeState());
    expect(props.botToMqttStatus).toEqual("up");
  });

  it("currentImage undefined", () => {
    const props = mapStateToProps(fakeState());
    expect(props.currentImage).toEqual(props.images[0]);
  });

  it("currentImage defined", () => {
    const state = fakeState();
    const secondImageUUID = Object.keys(state.resources.index.byKind.Image)[1];
    state.resources.consumers.farmware.currentImage = secondImageUUID;
    const props = mapStateToProps(state);
    const currentImageUUID = props.currentImage ? props.currentImage.uuid : "";
    expect(currentImageUUID).toEqual(secondImageUUID);
  });

});
