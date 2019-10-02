require "spec_helper"
describe PointGroup do
  let(:device) { FactoryBot.create(:user).device }

  it "maintains referential integrity" do
    PointGroupItem.destroy_all
    PointGroup.destroy_all
    Point.destroy_all
    expect(PointGroupItem.count).to eq(0)
    point = Points::Create.run!(x: 0,
                                y: 0,
                                z: 0,
                                device: device,
                                pointer_type: "GenericPointer")

    point_group = PointGroups::Create.run!(device: device,
                                           name: "test",
                                           point_ids: [point.id])
    expect(PointGroupItem.count).not_to eq(0)
    Points::Destroy.run!(point: point,
                         device: device,
                         hard_delete: true)
    expect(PointGroupItem.count).to eq(0)
  end
end
