require 'spec_helper'

describe CeleryScript::Checker do

  let(:hash) do
    {
      kind: "sequence",
      args: {
        version: 0
      },
      comment: "Properly formatted, syntactically valid sequence.",
      body: sequence_body_for(FactoryGirl.create(:sequence))
    }.deep_symbolize_keys
  end

  let(:tree) do
      CeleryScript::AstNode.new(hash)
  end

  let (:corpus) { Sequence::Corpus }

  let (:checker) { CeleryScript::Checker.new(tree, corpus) }

  it "runs through a syntactically valid program" do
      outcome = checker.run!
      expect(outcome).to be_kind_of(CeleryScript::AstNode)
      expect(outcome.comment).to eq("Properly formatted, syntactically valid"\
                                    " sequence.")
  end

  it "handles missing args" do
    tree.body.first.args[:location].args.delete(:x)
    expect(checker.valid?).to be(false)
    msg = checker.error.message
    expect(msg).to include("Expected node 'coordinate' to have a 'x'")
  end

  it "handles unknown args" do
    tree.body.first.args["foo"] = "bar"
    expect(checker.valid?).to be(false)
    msg = checker.error.message
    expect(msg).to include("unexpected arguments: [:foo].")
  end

  it "handles malformed / wrong type args" do
    tree.body.first.args[:location].args[:x] = "WRONG!"
    expect(checker.valid?).to be(false)
    msg = checker.error.message
    expect(msg).to eq("Expected 'x' to be a node or leaf, but it was neither")
  end

  it "returns an error rather than raising one via #run()" do
      outcome = checker.run
      expect(outcome).to be_kind_of(CeleryScript::AstNode)
      checker.tree.body.first.args[:x] = "No longer valid"
      expect(checker.run).to be_kind_of(CeleryScript::TypeCheckError)
  end

  it 'handles wrong leaf types' do
    hash[:body][0][:args][:location][:args][:x] = "supposed to be an Integer"
    result = checker.run
    expect(result.message).to eq("Expected leaf 'x' within 'coordinate' to"\
                                 " be one of: [Integer] but got String")
  end
end
