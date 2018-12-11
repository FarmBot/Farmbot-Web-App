require 'spec_helper'

module Fragments
  class Create < Mutations::Command
    H     = CeleryScript::HeapAddress
    K     = "__KIND__"

    STUFF = { device:          0,  # === Maybe cache
              fragment:        1,
              primitives:      {},
              args_names:      {}, # === Maybe cache
              kinds:           {}, # === Maybe cache
              nodes:           {},
              arg_sets:        {},
              primitive_pairs: {},
              standard_pairs:  {}, }

    STEPS = [ "Validate CeleryScript", #
              "Flatten CeleryScript",  #
              "move to background",    # ?
              "create node",           #
              "attach kind",
              "create arg group",
              "create primitive pairs",
              "create standard pairs",
              "stitch the nodes together", ]

    KINDS = CeleryScriptSettingsBag::Corpus
              .as_json[:nodes]
              .pluck("name")
              .sort
              .map(&:to_s)

    required do
      model :device, class: Device
      array :proto_nodes do
        hash { duck :*, methods: [] }
      end
    end

    def validate
    end

    def execute
      primitives       = {}
      fragment         = Fragment.new(device: device)
      null_node        = Node.new(kind: Kind.cached_by_value("nothing"),
                                  fragment: fragment)
      null_node.parent = null_node
      null_node.next   = null_node
      null_node.body   = null_node

      nodes      = proto_nodes.map do |flat_node|
        real_node = Node.new(kind:     Kind.cached_by_value(flat_node.fetch(K)),
                             fragment: fragment,
                             parent:   null_node,
                             next:     null_node,
                             body:     null_node,)
        arg_set   = ArgSet.new(node: real_node, fragment: fragment)
        flat_node.without(K).map do |(k,v)|
           if !k.starts_with?("__")
            arg_name = ArgName.cached_by_value(k.gsub("__", ""))
            primitive = primitives.fetch(v) do
              primitives[v] = Primitive.new(value: v, fragment: fragment)
            end
            pp       = PrimitivePair.new(arg_name:  arg_name,
                                         arg_set:   arg_set,
                                         primitive: primitive)
           end
          end
        real_node
      end

      proto_nodes.each_with_index do |flat_node, index|
        node = nodes.fetch(index)
        flat_node.without(K).map do |(k,v)|
          if k.starts_with?("__")
            case k
            when "__parent"
              nodes.fetch(index).parent = nodes.fetch(v.value)
            when "__next"
              nodes.fetch(index).next   = nodes.fetch(v.value)
            when "__body"
              nodes.fetch(index).body   = nodes.fetch(v.value)
            else
              StandardPair.new(fragment: fragment,
                               arg_set:  node.arg_set,
                               arg_name: ArgName.cached_by_value(k.gsub("__", "")),
                               node:     node)
            end
          end
        end
      end

      Node.transaction do
        nodes.map(&:save!)
      end
    end

    def null
      @null ||=  Node.new
    end
  end
end

describe CeleryScript::Checker do
  let(:device) { FactoryBot.create(:device) }
  let(:tool)   { FactoryBot.create(:tool, device: device) }
  let(:point)  { FactoryBot.create(:generic_pointer, device: device) }
  let(:corpus) { Sequence::Corpus }
  H = CeleryScript::HeapAddress
  it "loads CeleryScript from the database"
  it "dumps CeleryScript into the database" do
    # PROBLEMS THAT I MUST FIX:
    #   * FarmEvents currently don't have CeleryScript
    #   * SOON, Regimens will need celeryscript, too
    #   * Celeryscript only supports sequences today (bad).
    #   * Relocatable fragments would be cool
    device      = FactoryBot.create(:device)
    proto_nodes = [ { :__KIND__     => "nothing",
                      :__parent     => H[0],
                      :__body       => H[0],
                      :__next       => H[0] },
                    { :__KIND__     => "farm_event",
                      :__parent     => H[0],
                      :__body       => H[2],
                      :__next       => H[0] },
                    { :__KIND__     => "variable_declaration",
                      :__parent     => H[1],
                      :label        => "foo",
                      :__data_value => H[3],
                      :__body       => H[0],
                      :__next       => H[0] },
                    { :__KIND__     => "identifier",
                      :__parent     => H[2],
                      :label        => "makes no sense",
                      :data_type    => "coordinate",
                      :__body       => H[0],
                      :__next       => H[0] } ]
    results     = Fragments::Create.run!(device:      device,
                                         proto_nodes: proto_nodes)
    # [ { :__KIND__ => "nothing",
    #     :__parent => H[0],
    #     :__body   => H[0],
    #     :__next   => H[0] },
    #   {
    #     :__KIND__ => "farm_event",
    #     :__parent => H[0],
    #     :__body   => H[2],
    #     :__next   => H[0] },
    #   {
    #     :__KIND__=>"variable_declaration",
    #     :__parent=>H[1],
    #     :label=>"tool",
    #     :__data_value=>H[3],
    #     :__next=>H[4],
    #     :__body=>H[0] },
    #   {
    #     :__KIND__=>"tool",
    #     :__parent=>H[2],
    #     :tool_id=>1,
    #     :__body=>H[0],
    #     :__next=>H[0] },
    #   {
    #     :__KIND__=>"variable_declaration",
    #     :__parent=>H[2],
    #     :label=>"coordinate",
    #     :__data_value=>H[5],
    #     :__next=>H[6],
    #     :__body=>H[0] },
    #   {
    #     :__KIND__=>"coordinate",
    #     :__parent=>H[4],
    #     :x=>0,
    #     :y=>0,
    #     :z=>0,
    #     :__body=>H[0],
    #     :__next=>H[0] },
    #   {
    #     :__KIND__=>"variable_declaration",
    #     :__parent=>H[4],
    #     :label=>"point",
    #     :__data_value=>H[7],
    #     :__body=>H[0],
    #     :__next=>H[0]
    #   },
    #   {
    #     :__KIND__=>"point",
    #     :__parent=>H[6],
    #     :__body=>H[0],
    #     :__next=>H[0]}
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
