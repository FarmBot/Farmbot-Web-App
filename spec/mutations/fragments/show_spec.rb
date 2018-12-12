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
    result = Fragments::Show.run!(fragment_id: fragment.id, device: device)
    diff   =  HashDiff.diff(origin.without(:device), result.deep_symbolize_keys)
    expect(diff.length).to eq(0)
  end

  it "prevents N+1" do
    a2z    = (('a'..'z').to_a + ('0'..'9').to_a)
    body   = a2z.map do |label|
      {
        kind: "variable_declaration",
        args: {
          label: label,
          data_value: { kind: "coordinate", args: { x: 0, y: 1, z: 2, } }
        }
      }
    end
    origin = { device: device, kind: "internal_farm_event", args:{}, body: body }
    fragment = \
      Fragments::Create.run!(device: device, flat_ast: Fragments::Preprocessor.run!(origin))
    old_logger    = config.logger
    config.logger = Logger.new(STDOUT)
    result = Fragments::Show.run!(fragment_id: fragment.id, device: device)
    config.logger = old_logger
   end
end
