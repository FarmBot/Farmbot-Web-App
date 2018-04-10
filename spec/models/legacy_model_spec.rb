require "spec_helper"

describe "Legacy models" do
  let(:device) { FactoryBot.create(:device) }

  it "does not broadcast the changes" do
    [LegacyToolSlot, LegacyGenericPointer, LegacyPlant]
      .map(&:new)
      .map(&:broadcast?)
      .map{ |x| expect(x).to be(false) }
  end

  it "migrates tool_slots" do
    tool    = Tool.create!(name: "test case", device: device)
    ts      = LegacyToolSlot.create!(tool_id: tool.id, pullout_direction: 1)
    pointer = ToolSlot.create!(pointer_type: "ToolSlot",
                               pointer_id:   ts.id,
                               device:       device,
                               x:            0,
                               y:            0,
                               z:            0)
    expect(pointer.tool_id).to eq(nil)
    expect(pointer.pullout_direction).to eq(0)
    pointer.do_migrate
    expect(pointer.tool_id).to eq(tool.id)
    expect(pointer.pullout_direction).to eq(1)
  end

  it "migrates plants" do
    plant   = LegacyPlant.create!(openfarm_slug: "churros",
                                  plant_stage:   "planted")
    pointer = Plant.create!(pointer_type: "Plant",
                            pointer_id:   plant.id,
                            device:       device,
                            x:            0,
                            y:            0,
                            z:            0)
    expect(pointer.openfarm_slug).to eq("50")
    expect(pointer.plant_stage).to   eq("planned")
    pointer.do_migrate
    expect(pointer.openfarm_slug).to eq("churros")
    expect(pointer.plant_stage).to   eq("planted")
  end
end
