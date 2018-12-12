require 'spec_helper'

describe Fragments::Create do
  let(:device) { FactoryBot.create(:device) }
  let(:tool)   { FactoryBot.create(:tool, device: device) }
  let(:point)  { FactoryBot.create(:generic_pointer, device: device) }

  it "reconstructs CeleryScript from the database" do
    flat_ast = Fragments::Preprocessor.run!(device: device,
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
            ])
    original = Fragments::Create.run!(device: device, flat_ast: flat_ast)
    fragment = Fragments::Show.run!(fragment_id: original.id, device: device)

    # binding.pry
  end
end
