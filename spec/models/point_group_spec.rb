require "spec_helper"
describe PointGroup do
  let(:device) { FactoryBot.create(:user).device }

  it "maintains referential integrity" do
    point = Points::Create.run!(x: 0,
                                y: 0,
                                z: 0,
                                device: device,
                                pointer_type: "GenericPointer")

    point_group = PointGroups::Create.run!(device: device,
                                           name: "test",
                                           point_ids: [point.id])
    expect do
      Points::Destroy.run!(point: point, device: device)
    end.to(raise_error(Mutations::ValidationException))
  end
end
