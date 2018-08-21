require "spec_helper"
describe "Body nodes" do
  test_corpus = CeleryScript::Corpus
                  .new
                  .arg(:foo, [Integer])
                  .node(:wrong, [], [])
                  .node(:bar, [:foo], [])
                  .node(:baz, [], [:bar])
  let(:device) { FactoryBot.create(:device) }

  it "always always empty bodies" do
    tree = CeleryScript::AstNode.new({
      "kind": "baz",
      "args": {},
      "body": []
    })
    checker = CeleryScript::Checker.new(tree, test_corpus, device)
    expect(checker.valid?).to eq(true)
  end

  it "kicks back unexpected nodes" do
    tree = CeleryScript::AstNode.new({
      "kind": "baz",
      "args": {},
      "body": [{ "kind": "wrong", "args": {}}]
    })
    checker = CeleryScript::Checker.new(tree, test_corpus, device)
    expect(checker.valid?).to eq(false)
    expect(checker.error.message).to include("node contains 'wrong' node")
  end

  it "handles body members of nodes that shouldn't have bodies." do
    tree = CeleryScript::AstNode.new({
      "kind": "baz",
      "args": {},
      "body": [{ "kind": "wrong", "args": {}}]
    })
    checker = CeleryScript::Checker.new(tree, test_corpus, device)
    expect(checker.valid?).to eq(false)
    expect(checker.error.message).to include("node contains 'wrong' node")
  end

  it 'disallows leaves in the body field of a node' do
    tree = CeleryScript::AstNode.new({
        "kind": "wrong",
        "args": {},
        "body": [
          {
            "kind": "wrong",
            "args": {}
          }
        ]
      })
    checker  = CeleryScript::Checker.new(tree, test_corpus, device)
    actual   = checker.error.message
    expected = "Body of 'wrong' node contains 'wrong' node"
    expect(actual).to include(expected)
  end
end
