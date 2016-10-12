require 'spec_helper'

describe CeleryScript::TreeClimber do
  FIXTURE_FILE = File.read("/home/rick/code/farmbot/api/spec/mutations/sequences/improved_ast_fixture.json")
  let(:node) do
      hash = JSON.parse(FIXTURE_FILE).deep_symbolize_keys
      CeleryScript::AstNode.new(hash)
  end

  it "travels to each node" do
      kinds = []
      callback = ->(node) { kinds.push(node.kind) }
      begin
        CeleryScript::TreeClimber.travel(node, callback)
      rescue => exception
        binding.pry        
      end
      kinds.sort!
      binding.pry
  end
end