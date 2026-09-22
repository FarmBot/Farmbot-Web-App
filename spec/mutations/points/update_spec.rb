require "spec_helper"
require_relative "scenario"

describe Points::Update do
  let(:device) { FactoryBot.create(:device) }
  let(:point) do
    FactoryBot.create(:generic_pointer, device: device, meta: { a: 1, b: 2 })
  end

  it "updates meta attributes (but doesn't clobber old ones)" do
    new_meta = { c: 3, d: 4 }
    Points::Update.run(device: point.device, point: point, meta: new_meta)
    point.reload
    expect(point.meta["a"]).to eq("1")
    expect(point.meta["b"]).to eq("2")
    expect(point.meta["c"]).to eq("3")
    expect(point.meta["d"]).to eq("4")
  end

  it "updates tool slot mounting attributes" do
    slot = FactoryBot.create(:tool_slot, device: device)
    attributes = { mount_offset_x: 1.5,
                   mount_offset_y: 2.5,
                   mount_offset_z: 3.5,
                   mount_stage: ToolSlot::MOUNT_STAGE_Z }

    result = Points::Update.run!(attributes.merge(device: device, point: slot))

    attributes.each { |key, value| expect(result.send(key)).to eq(value) }
  end

  it "prevents remove of tool from actively used tool slots" do
    s = Points::Scenario.new
    result = Points::Update.run(device: s.device,
                                point: s.tool_slot,
                                tool_id: nil)
    expect(result.success?).to be(false)
    expect(result.errors.message_list).to include(Tool::IN_USE % s.sequence[:name])
  end
end
