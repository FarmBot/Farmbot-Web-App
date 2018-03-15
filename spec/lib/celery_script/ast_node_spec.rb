require 'spec_helper'

describe CeleryScript::AstNode do
  FIXTURE_FILE = File.read("./spec/lib/celery_script/ast_fixture2.json")

  let(:hash) do
      JSON.parse(FIXTURE_FILE).deep_symbolize_keys
  end

  let (:node) { CeleryScript::AstNode.new(**hash) }

  it "initializes" do
    expect(node.kind).to eq("other")
    expect(node.body.length).to eq(3)
    expect(node.body[0].kind).to eq("var_get")
    expect(node.body[1].kind).to eq("whatever")
    expect(node.args[:x].value).to eq(-1)
    expect(node.args[:x]).to be_kind_of(CeleryScript::AstLeaf)
  end

  it "invalidates a node" do
    expect { node.invalidate!("Boo!") }.to raise_error("Boo!")
  end
end
