require "spec_helper"
describe Devices::Dump do
  # Resources that I can't easily instantiate via FactoryBot
  SPECIAL     = [:points, :sequences, :device]
  ADDITIONAL  = [:plants, :tool_slots, :generic_pointers]
  MODEL_NAMES = Devices::Dump::RESOURCES.without(*SPECIAL).concat(ADDITIONAL)
  NOPE        = "Expected value[%s] to equal %s. Got %s instead"

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
    plant = device
      .points
      .where(pointer_type: "Plant")
      .last
    plant.discard
    results   = Devices::Dump.run!(device: device)
    MODEL_NAMES
      .concat(SPECIAL)
      .without(:device, :plants, :tool_slots, :generic_pointers, :points)
      .map do |name|
        actual   = results[name]
        expect(actual).to be
        expected = device.send(name).map(&:body_as_json)
        if(actual != expected)
          tpl = [name, expected, actual]
          fail(NOPE % tpl.map{|x| (x).inspect.to_s.first(25) })
        end
      end
    # Tests for a regression noted on 1 may 18:
    tool = results[:tools].find { |x| x[:id] == tools.last.id }
    expect(tool).to be
    expect(tool[:status]).to eq("active")
    # Expect archived points to show up.
    serialized_plant = \
      results[:points].find { |x| x[:id] == plant.id }
    expect(serialized_plant).to be
    expect(plant.discarded?).to be true
    expect(results[:export_created_at]).to be
    export_time = Time.parse(results[:export_created_at])
    today       = Time.now
    expect(today - export_time).to be < 1
    expect(results[:database_schema])
      .to eq(ActiveRecord::Migrator.current_version)
    expect(results[:server_url]).to eq($API_URL)
  end
end
