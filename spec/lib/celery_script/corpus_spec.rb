require 'spec_helper'

describe CeleryScript::Corpus do
  let (:corpus) { Sequence::Corpus }

  it "serializes into JSON" do
      result = JSON.parse(corpus.to_json)

      expect(result["tag"]).to eq(1)
      expect(result["args"]).to be_kind_of(Array)
      expect(result["nodes"]).to be_kind_of(Array)
      expect(result["nodes"].sample.keys.sort).to eq(["allowed_args",
                                                      "allowed_body_types",
                                                      "name"])
      expect(result["args"].sample.keys.sort).to eq(["allowed_values",
                                                     "name"])
  end

  it "Handles error validations for version 1" do
    # This test is __ONLY__ relevant for version 1.
    # Change / delete / update as needed.
    expect(SequenceMigration::Base.latest_version).to eq(1)
        tree = CeleryScript::AstNode.new({
      "kind": "send_message",
      "args": {
        "message": "Hello, world!",
        "message_type": "wrong"
      },
      "body": [
        {
          "kind": "channel",
          "args": { "channel_name": "also_wrong" }
        }
      ]
    })
    checker = CeleryScript::Checker.new(tree, CeleryScriptSettingsBag::Corpus)
    binding.pry
  end
end