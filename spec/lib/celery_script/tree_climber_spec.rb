require 'spec_helper'

describe CeleryScript::TreeClimber do
  file_path = File.read("/home/rick/code/farmbot/api/spec/mutations/sequences/improved_ast_fixture.json")
  let(:node) do
      hash = JSON.parse(file_path).deep_symbolize_keys
      CeleryScript::AstNode.new(hash)
  end

  it "travels to each node" do
      kinds = []
      callback = ->(node) { kinds.push(node.kind) }
      CeleryScript::TreeClimber.travel(node, callback)
      kinds.sort!
      expect(kinds.length).to eq(5)
      expect(kinds.first).to eq("blah")
      expect(kinds.last).to eq("whatever")
  end
end