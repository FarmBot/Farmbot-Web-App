require 'spec_helper'

describe CeleryScript::Checker do
  let(:device) { FactoryBot.create(:device) }
  let(:tool)   { FactoryBot.create(:tool, device: device) }
  let(:point)  { FactoryBot.create(:generic_pointer, device: device) }
  let(:corpus) { Sequence::Corpus }

  it "thinks about how we're going to store this stuff" do
    # [
    #   {
    #     :__KIND__=>"nothing",
    #     :__parent=>HeapAddress(0),
    #     :__body=>HeapAddress(0),
    #     :__next=>HeapAddress(0)
    #   }, {
    #     :__KIND__=>"farm_event",
    #     :__parent=>HeapAddress(0),
    #     :__body=>HeapAddress(2),
    #     :__next=>HeapAddress(0)
    #   }, {
    #     :__KIND__=>"variable_declaration",
    #     :__parent=>HeapAddress(1),
    #     :label=>"foo",
    #     :__data_value=>HeapAddress(3),
    #     :__body=>HeapAddress(0),
    #     :__next=>HeapAddress(0)
    #   }, {
    #     :__KIND__=>"identifier",
    #     :__parent=>HeapAddress(2),
    #     :label=>"makes no sense",
    #     :data_type=>"coordinate",
    #     :__body=>HeapAddress(0),
    #     :__next=>HeapAddress(0)
    #   }
    # ]

    # [
    #   {
    #     :__KIND__=>"nothing",
    #     :__parent=>HeapAddress(0),
    #     :__body=>HeapAddress(0),
    #     :__next=>HeapAddress(0)
    #   },
    #   {
    #     :__KIND__=>"farm_event",
    #     :__parent=>HeapAddress(0),
    #     :__body=>HeapAddress(2),
    #     :__next=>HeapAddress(0)
    #   },
    #   {
    #     :__KIND__=>"variable_declaration",
    #     :__parent=>HeapAddress(1),
    #     :label=>"tool",
    #     :__data_value=>HeapAddress(3),
    #     :__next=>HeapAddress(4),
    #     :__body=>HeapAddress(0)
    #   },
    #   {
    #     :__KIND__=>"tool",
    #     :__parent=>HeapAddress(2),
    #     :tool_id=>1,
    #     :__body=>HeapAddress(0),
    #     :__next=>HeapAddress(0)
    #   },
    #   {
    #     :__KIND__=>"variable_declaration",
    #     :__parent=>HeapAddress(2),
    #     :label=>"coordinate",
    #     :__data_value=>HeapAddress(5),
    #     :__next=>HeapAddress(6),
    #     :__body=>HeapAddress(0)
    #   },
    #   {
    #     :__KIND__=>"coordinate",
    #     :__parent=>HeapAddress(4),
    #     :x=>0,
    #     :y=>0,
    #     :z=>0,
    #     :__body=>HeapAddress(0),
    #     :__next=>HeapAddress(0)
    #   },
    #   {
    #     :__KIND__=>"variable_declaration",
    #     :__parent=>HeapAddress(4),
    #     :label=>"point",
    #     :__data_value=>HeapAddress(7),
    #     :__body=>HeapAddress(0),
    #     :__next=>HeapAddress(0)
    #   },
    #   {
    #     :__KIND__=>"point",
    #     :__parent=>HeapAddress(6),
    #     :__body=>HeapAddress(0),
    #     :__next=>HeapAddress(0)}
    #     :pointer_type=>"GenericPointer",
    #     :pointer_id=>1,
    # ]
  end

  it "disallows the use of `identifier` nodes" do
    params = { kind: "farm_event",
               args: {},
               body: [ {kind: "variable_declaration",
                        args: {
                          label: "foo",
                          data_value: {
                            kind: "identifier",
                            args: {
                              label: "makes no sense",
                              data_type: "coordinate"
                            }
                          }
                        } } ]
    }
    tree    = CeleryScript::AstNode.new(**params)
    checker = CeleryScript::Checker.new(tree, corpus, device)
    expect { checker.run! }.to raise_error(CeleryScript::TypeCheckError)
  end

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
    params  = { kind: "farm_event", body: body, args: {} }
    tree    = CeleryScript::AstNode.new(**params)
    checker = CeleryScript::Checker.new(tree, corpus, device)
    expect { checker.run! }.not_to(raise_error)
    # @flat_ir ||= Celery::Slicer.new.run!(sequence_hash)
  end
end
