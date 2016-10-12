require 'spec_helper'

describe AstNode do
  FIXTURE_FILE = File.read("/home/rick/code/farmbot/api/spec/mutations/sequences/improved_ast_fixture.json")
  let(:hash) do
      JSON.parse(FIXTURE_FILE).deep_symbolize_keys
  end

  it "initializes" do
    node = AstNode.new(**hash)
    expect(node.kind).to eq("sequence")
    expect(node.body.length).to eq(2)
    expect(node.body[0].kind).to eq("other")
    expect(node.body[1].kind).to eq("whatever")
    expect(node.args[:x].kind).to eq("blah")
    expect(node.args[:x].args[:data_value]).to be_kind_of(AstNode)
  end
end