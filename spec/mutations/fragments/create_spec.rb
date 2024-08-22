require "spec_helper"

describe Fragments::Create do
  let(:device) { FactoryBot.create(:device) }
  let(:tool) { FactoryBot.create(:tool, device: device) }
  let(:point) { FactoryBot.create(:generic_pointer, device: device) }
  let(:farm_event) { FactoryBot.create(:farm_event, device: device) }
  H = CeleryScript::HeapAddress
  KLASSES = [ArgSet, Fragment, Node, Primitive, PrimitivePair, StandardPair]

  before(:each) do
    destroy_everything!
  end

  it "disallows using resource_placeholder outside of param declarations" do
    params = {
      device: device,
      kind: "internal_farm_event",
      args: {},
      body: [
        {
          kind: "parameter_application",
          args: {
            label: "var1",
            data_value: {
              kind: "resource_placeholder",
              args: {
                resource_type: "Sequence",
              },
            },
          },
        },
      ],
    }

    err = CeleryScript::TypeCheckError
    msg = CeleryScriptSettingsBag::BAD_PLACEHOLDER
    expect{
      Fragments::Preprocessor.run!(**params)
    }.to raise_error(err, msg)
  end

  it "loads CeleryScript from the database" do
    tool = FactoryBot.create(:tool, device: device)
    flat_ast = Fragments::Preprocessor.run!(device: device,
                                            kind: "internal_farm_event",
                                            args: {},
                                            body: [
                                              {
                                                kind: "parameter_application",
                                                args: {
                                                  label: "myLabel123",
                                                  data_value: { kind: "coordinate", args: { x: 0, y: 1, z: 2 } },
                                                },
                                              },
                                              {
                                                kind: "parameter_application",
                                                args: {
                                                  label: "other thing",
                                                  data_value: { kind: "tool", args: { tool_id: tool.id } },
                                                },
                                              },
                                            ])
    fragment = Fragments::Create.run!(device: device,
                                      flat_ast: flat_ast,
                                      owner: farm_event)
    nodes = fragment.nodes.sort_by(&:id)
    entry = nodes[1]
    variable2 = entry.body.next
    pair = variable2.arg_set.standard_pairs.first
    expect(entry.kind.value).to eq("internal_farm_event")
    expect(entry.next.kind.value).to eq("internal_entry_point")
    expect(entry.body.kind.value).to eq("parameter_application")
    expect(variable2.kind.value).to eq("parameter_application")
    expect(variable2.next.kind.value).to eq("internal_entry_point")
    expect(pair.arg_name.value).to eq("data_value")
    expect(pair.node.kind.value).to eq("tool")
    tool_id = pair.node.arg_set.primitive_pairs.first.arg_name.value
    expect(tool_id).to eq("tool_id")
  end

  it "dumps CeleryScript into the database" do
    flat_ast = [
      {
        :__KIND__ => "nothing",
        :__parent => H[0],
        :__body => H[0],
        :__next => H[0],
      },
      {
        :__KIND__ => "internal_farm_event",
        :__parent => H[0],
        :__body => H[2],
        :__next => H[0],
      },
      {
        :__KIND__ => "parameter_application",
        :__parent => H[1],
        :label => "foo",
        :__data_value => H[3],
        :__body => H[0],
        :__next => H[0],
      },
      {
        :__KIND__ => "identifier",
        :__parent => H[2],
        :label => "makes no sense",
        :data_typ => "coordinate",
        :__body => H[0],
        :__next => H[0],
      },
    ]

    b4_counts = KLASSES.reduce({}) do |acc, klass|
      acc[klass] = klass.count
      acc
    end
    fragment = Fragments::Create.run!(owner: farm_event,
                                      flat_ast: flat_ast)
    KLASSES.map { |k| flunk "#{k} did not save" if k.count <= b4_counts[k] }
    nodes = fragment.nodes.sort_by(&:id)
    expect(nodes[0].kind.value).to eq("internal_entry_point")
    expect(nodes[1].kind.value).to eq("internal_farm_event")
    expect(nodes[2].kind.value).to eq("parameter_application")
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
end
