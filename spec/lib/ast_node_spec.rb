require 'spec_helper'

describe AstNode do
  FIXTURE_FILE = File.read("/home/rick/code/farmbot/api/spec/mutations/sequences/improved_ast_fixture.json")
  let(:hash) do
      JSON.parse(FIXTURE_FILE).deep_symbolize_keys
  end

  it "initializes" do
    node = AstNode.new(**hash)
    binding.pry
  end
end