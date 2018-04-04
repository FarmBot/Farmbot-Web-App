require 'spec_helper'
require_relative "scenario"

describe Points::Destroy do
  it "prevents deletion of points that are in use" do
    # Create device
    device = FactoryBot.create(:device)
    # create many points
    points = FactoryBot.create_list(:point, 3, device: device)
    # use one point in a sequence.
    params = {
      name:   "Test Case I",
      device: device,
      body: [
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: {
              kind: "point",
              args: {
                pointer_type: "GenericPointer",
                pointer_id: points.sample.id
              }
            },
            offset: { kind: "coordinate", args:{ x: 0, y: 0, z: 0 } }
          },
        }
      ]
    }
    sequence = Sequences::Create.run!(params)
    before   = Point.count
    # Attempt to delete
    result   = Points::Destroy.run(point_ids: points.pluck(:id), device: device)
    # Expect error about point in use still.
    expect(result.success?).to be false
    expect(Point.count).to eq(before)
    expect(result.errors.message_list.count).to eq(1)
    expect(result.errors.message_list.first).to include(params[:name])
    expect(result.errors.message_list.first).to include("still using it")
  end

  it "prevents deletion of active tool slots" do
    s      = Points::Scenario.new
    point_ids = [s.tool_slot.id]
    result = Points::Destroy.run(point_ids: point_ids, device: s.device)
    expect(result.success?).to be(false)
    expect(result.errors.message_list)
      .to include(Points::Destroy::STILL_IN_USE % s.sequence[:name])
  end
end
