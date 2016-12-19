require "spec_helper"
describe "Body nodes" do
  test_corpus = CeleryScript::Corpus
                  .new
                  .defineArg(:foo, [Fixnum])
                  .defineNode(:wrong, [], [])
                  .defineNode(:bar, [:foo], [])
                  .defineNode(:baz, [], [:bar])
  it "always always empty bodies" do
    tree = CeleryScript::AstNode.new({
      "kind": "baz",
      "args": {},
      "body": []
    })
    checker = CeleryScript::Checker.new(tree, test_corpus)
    expect(checker.valid?).to eq(true)
  end

  it "kicks back unexpected nodes" do
    tree = CeleryScript::AstNode.new({
      "kind": "baz",
      "args": {},
      "body": [{ "kind": "wrong", "args": {}}]
    })
    checker = CeleryScript::Checker.new(tree, test_corpus)
    expect(checker.valid?).to eq(false)
    expect(checker.error.message).to include(
      "node contains `wrong` node"
    )
  end

  it 'disallows leaves in the body field of a node' do
    expect do
      CeleryScript::AstNode.new({
        "kind": "baz",
        "args": {},
        "body": ["wrong"]
      })
    end.to raise_error(CeleryScript::TypeCheckError)
  end
end