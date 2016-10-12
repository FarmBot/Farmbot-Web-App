require 'spec_helper'

describe CeleryScript::TreeClimber do
  file_path = File.read("/home/rick/code/farmbot/api/spec/mutations/sequences/improved_ast_fixture.json")

  let(:node) do
      hash = JSON.parse(file_path).deep_symbolize_keys
      CeleryScript::AstNode.new(hash)
  end

  it "travels to each node with a callable object" do
      kinds = []
      callback = ->(node) { kinds.push(node.kind) }
      CeleryScript::TreeClimber.travel(node, callback)
      kinds.sort!
      expect(kinds.length).to eq(5)
      expect(kinds.first).to eq("blah")
      expect(kinds.last).to eq("whatever")
  end

  it "searches the tree for a specific `kind`" do
    query = CeleryScript::TreeClimber.find_all_by_kind(node, "var_get")
    expect(query.length).to eq(1)
    expect(query.first.kind).to eq("var_get")
  end
end