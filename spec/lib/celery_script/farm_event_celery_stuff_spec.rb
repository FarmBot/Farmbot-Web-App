require 'spec_helper'

describe CeleryScript::Checker do
  let(:device) { FactoryBot.create(:device) }
  let(:corpus) { Sequence::Corpus           }

  it "runs through a syntactically valid program" do
    tree    = CeleryScript::AstNode.new(kind: "farmevent_validation",
                                        body: [{ kind: "nothing", args: {} }],
                                        args: {})
    checker = CeleryScript::Checker.new(tree, corpus, device)
    outcome = checker.run!
    binding.pry
  end
end
