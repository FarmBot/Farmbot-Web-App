require 'spec_helper'

describe Fragments::Create do
  let(:device) { FactoryBot.create(:device) }
  let(:tool)   { FactoryBot.create(:tool, device: device) }
  let(:point)  { FactoryBot.create(:generic_pointer, device: device) }

  it "reconstructs CeleryScript from the database" do
    origin = {
      device: device,
      kind:   "internal_farm_event",
      args:   {},
      body:   [
        {
          kind: "variable_declaration",
          args: {
            label: "myLabel123",
            data_value: { kind: "coordinate", args: { x: 0, y: 1, z: 2, } }
          }
        },
        {
          kind: "variable_declaration",
          args: {
            label: "other thing",
            data_value: { kind: "tool", args: { tool_id: tool.id } }
          }
        }
      ]
    }
    flat_ast = Fragments::Preprocessor.run!(origin)
    fragment = Fragments::Create.run!(device: device, flat_ast: flat_ast)
    old_logger    = config.logger
    config.logger = Logger.new(STDOUT)
    result = Fragments::Show.run!(fragment_id: fragment.id, device: device)
    diff   =  HashDiff.diff(origin.without(:device), result.deep_symbolize_keys)
    expect(diff.length).to eq(0)
    config.logger = old_logger
  end
end
