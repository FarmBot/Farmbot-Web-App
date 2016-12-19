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

  it "Handles message_type validations for version 1" do
    # This test is __ONLY__ relevant for version 1.
    # Change / delete / update as needed.
    expect(SequenceMigration::Base.latest_version).to eq(1)
        tree = CeleryScript::AstNode.new({
      "kind": "send_message",
      "args": {
        "message": "Hello, world!",
        "message_type": "wrong"
      },
      "body": []
    })
    checker = CeleryScript::Checker.new(tree, CeleryScriptSettingsBag::Corpus)
    expect(checker.error.message).to include("not a valid message_type")
  end

  it "Handles channel_name validations for version 1" do
    # This test is __ONLY__ relevant for version 1.
    # Change / delete / update as needed.
    expect(SequenceMigration::Base.latest_version).to eq(1)
        tree = CeleryScript::AstNode.new({
      "kind": "send_message",
      "args": {
        "message": "Hello, world!",
        "message_type": "fun"
      },
      "body": [
        {
          "kind": "channel",
          "args": { "channel_name": "wrong" }
        }
      ]
    })
    checker = CeleryScript::Checker.new(tree, CeleryScriptSettingsBag::Corpus)
    expect(checker.error.message).to include("not a valid channel_name")
  end
end