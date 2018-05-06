require "spec_helper"
describe Devices::Dump do
  # Resources that I can't easily instantiate via FactoryBot
  SPECIAL     = [:points, :sequences, :device]
  ADDITIONAL  = [:plants, :tool_slots, :generic_pointers]
  MODEL_NAMES = Devices::Dump::RESOURCES.without(*SPECIAL).concat(ADDITIONAL)

  it "serializes _all_ the data" do
    device    = FactoryBot.create(:device)
    resources = MODEL_NAMES
                  .map { |x| x.to_s.singularize.to_sym }
                  .map { |x| FactoryBot.create_list(x, 4, device: device) }
    tools     = FactoryBot.create_list(:tool, 3, device: device)
    device
      .points
      .where(pointer_type: "ToolSlot")
      .last
      .update_attributes(tool_id: tools.last.id)
    results   = Devices::Dump.run!(device: device)
    MODEL_NAMES
      .concat(SPECIAL)
      .without(:device, :plants, :tool_slots, :generic_pointers)
      .map do |name|
        expect(results[name]).to be
        expect(results[name]).to eq(device.send(name).map(&:body_as_json))
      end
    # Tests for a regression noted on 1 may 18:
    tool = results[:tools].find { |x| x[:id] == tools.last.id }
    expect(tool).to be
    expect(tool[:status]).to eq("active")
  end
end
