require 'spec_helper'

describe CeleryScript::Checker do
  let(:device) { FactoryBot.create(:device) }
  let(:tool)   { FactoryBot.create(:tool, device: device) }
  let(:point)  { FactoryBot.create(:generic_pointer, device: device) }
  let(:corpus) { Sequence::Corpus }
  H = CeleryScript::HeapAddress
  KLASSES = [ ArgSet, Fragment, Node, Primitive, PrimitivePair, StandardPair ]
  it "loads CeleryScript from the database" do
    proto_nodes = [{ :__KIND__ => "nothing",
                     :__parent => H[0],
                     :__body   => H[0],
                     :__next   => H[0] },
                   { :__KIND__ => "farm_event",
                     :__parent => H[0],
                     :__body   => H[2],
                     :__next   => H[0] },
                   { :__KIND__=>"variable_declaration",
                     :__parent=>H[1],
                     :label=>"tool",
                     :__data_value=>H[3],
                     :__next=>H[4],
                     :__body=>H[0] },
                   { :__KIND__=>"tool",
                     :__parent=>H[2],
                     :tool_id=>1,
                     :__body=>H[0],
                     :__next=>H[0] },
                   { :__KIND__=>"variable_declaration",
                     :__parent=>H[2],
                     :label=>"coordinate",
                     :__data_value=>H[5],
                     :__next=>H[6],
                     :__body=>H[0] },
                   { :__KIND__=>"coordinate",
                     :x=>0, :y=>0, :z=>0,
                     :__parent=>H[4],
                     :__body=>H[0],
                     :__next=>H[0] },
                   { :__KIND__=>"variable_declaration",
                     :__parent=>H[4],
                     :label=>"point",
                     :__data_value=>H[7],
                     :__body=>H[0],
                     :__next=>H[0] },
                   { :__KIND__=>"point",
                     :__parent=>H[6],
                     :__body=>H[0],
                     :__next=>H[0],
                     :pointer_type=>"GenericPointer",
                     :pointer_id=>1, } ]
    fragment = Fragments::Create.run!(device: device, proto_nodes: proto_nodes)
    point    = fragment.nodes.find_by(kind: Kind.cached_by_value("point"))
    binding.pry
  end

  it "dumps CeleryScript into the database" do
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

    Node.destroy_all
    Fragment.destroy_all
    b4_counts = KLASSES.reduce({}) do |acc, klass|
      acc[klass] = klass.count
      acc
    end
    fragment = Fragments::Create.run!(device: device, proto_nodes: proto_nodes)
    KLASSES.map { |k| flunk "#{k} did not save" if k.count <= b4_counts[k] }
    nodes = fragment.nodes.sort_by(&:id);
    expect(nodes[0].kind.value).to eq("nothing")
    expect(nodes[1].kind.value).to eq("farm_event")
    expect(nodes[2].kind.value).to eq("variable_declaration")
    expect(nodes[3].kind.value).to eq("identifier")
    expect(nodes[3].arg_set.primitive_pairs.count).to eq 2
    Node.destroy_all
    Fragment.destroy_all
    expect(ArgSet.count).to eq(0)
    expect(Node.count).to eq(0)
    expect(PrimitivePair.count).to eq(0)
    expect(StandardPair.count).to eq(0)
    expect(Primitive.count).to eq(0)
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
  end
end

