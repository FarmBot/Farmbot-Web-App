require 'spec_helper'

describe CeleryScript::Checker do

  let(:hash) do
    {
      kind: "sequence",
      args: {
        locals: Sequence::SCOPE_DECLARATION,
        version: 0
      },
      comment: "Properly formatted, syntactically valid sequence.",
      body: sequence_body_for(FactoryBot.create(:sequence))
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

  it "finds a bad leaf" do
    parent = CeleryScript::AstNode.new(parent = nil, args: {}, kind: "nothing")
    expect {
      checker.check_leaf CeleryScript::AstLeaf.new(parent, 6, :location)
    }.to raise_error(CeleryScript::TypeCheckError)
  end

  it "validates subsequence presence" do
    hash[:body] = [
      { kind: "execute", args: { sequence_id: 0 } },
    ]
    chk = CeleryScript::Checker.new(tree, corpus)
    expect(chk.valid?)
      .to be false
    expect(chk.error.message)
      .to eq("missing a sequence selection for `execute` block.")
  end

  it "validates peripheral presence" do
    hash[:body] = [
      { kind: "read_peripheral", args: { peripheral_id: 0, pin_mode: 0 } }
    ]
    chk = CeleryScript::Checker.new(tree, corpus)
    expect(chk.valid?)
      .to be false
    expect(chk.error.message)
      .to eq("You must select a peripheral before writing to it.")
  end

  it "Catches bad `pin_type`s in `read_pin`" do
    hash[:body] = [
      {
        kind: "read_pin",
        args: {
          pin_mode:   0,
          label:      "pin",
          pin_number: {
            kind: "named_pin",
            args: {
              pin_type: "Not correct",
              pin_id: 1
            }
          }
        }
      }
    ]
    chk = CeleryScript::Checker.new(tree, corpus)
    expect(chk.valid?).to be false
    expect(chk.error.message).to include("not a type of pin")
  end

  it "Catches bad `pin_type`s in `read_pin`" do
    p = FactoryBot.create(:peripheral)
    hash[:body] = [
      {
        kind: "read_pin",
        args: {
          pin_mode: 0,
          label: "pin",
          pin_number: {
            kind: "named_pin",
            args: { pin_type: p.class.name, pin_id: p.id }
          }
        }
      }
    ]
    chk = CeleryScript::Checker.new(tree, corpus)
    expect(chk.valid?).to be false
    expect(chk.error.message).to include("not a type of pin")
  end
end
