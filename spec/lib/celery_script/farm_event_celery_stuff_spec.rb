require 'spec_helper'

describe CeleryScript::Checker do
  let(:device) { FactoryBot.create(:device) }
  let(:tool)   { FactoryBot.create(:tool, device: device) }
  let(:point)  { FactoryBot.create(:generic_pointer, device: device) }
  let(:corpus) { Sequence::Corpus }

  it "disallows the use of `identifier` nodes"

  it "runs through a syntactically valid program" do
  body = [
           {
             kind: "variable_declaration",
             args: {
               label: "tool",
               data_value: {
                 kind: "tool",
                 args: {
                   tool_id: tool.id
                 }
               }
             }
           },
           {
             kind: "variable_declaration",
             args: {
               label: "coordinate",
               data_value: {
                 kind: "coordinate",
                 args: {
                   x: 0,
                   y: 0,
                   z: 0
                  }
             }
            }
           },
           {
             kind: "variable_declaration",
             args: {
               label: "point",
               data_value: {
                 kind: "point",
                 args: { pointer_type: "GenericPointer", pointer_id: point.id }
               }
             }
           }
         ]
    tree    = \
      CeleryScript::AstNode.new(kind: "farm_event",
      body: body, args: {})
    checker = CeleryScript::Checker.new(tree, corpus, device)
    expect { checker.run! }.not_to(raise_error)
  end
end
