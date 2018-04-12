require "spec_helper"

describe "Point deletion edge cases" do
  let(:device) { FactoryBot.create(:device) }

  it "cant delete toolslots that have a tool that are in use by sequences" do
    tool      = FactoryBot.create(:tool, device: device, name: "tool")
    tool_slot = FactoryBot.create(:tool_slot,
                                  device: device,
                                  tool_id: tool.id,
                                  name: "tool slot")
    sequence  = Sequences::Create.run!(
      device: device,
      name: "sequence",
      args: {
        version: 20180209,
        locals: { kind: "scope_declaration", args: {} }
      },
      body: [{
          kind: "move_absolute",
          args: {
            speed: 100,
            location: { kind: "tool", args: { tool_id: tool.id } },
            offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0} }
          },
        }])
    result = Points::Destroy.run(point_ids: [tool_slot.id], device: device)
    errors = result.errors.message_list
    expect(errors)
      .to include(Points::Destroy::STILL_IN_USE % ["sequence", "tool"])
  end
end
