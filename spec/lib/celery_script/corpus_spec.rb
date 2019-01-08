require 'spec_helper'

describe CeleryScript::Corpus do
  let(:device) { FactoryBot.create(:device) }
  let(:corpus) { Sequence::Corpus }
  it "Enforces correct `group_type`s`" do
    not_ok = CeleryScript::AstNode.new({
      kind: "every_point",
      args: { group_type: "Veggies" }
    })
    check1 = CeleryScript::Checker.new(not_ok, corpus, device)
    expect(check1.valid?).to eq(false)
    expect(check1.error.message).to include("not a type of group")
  end

  it "does not all `every_location` in `move_absolute`" do
    not_ok = CeleryScript::AstNode.new({
      kind: "move_absolute",
      args: {
        location: {
          kind: "every_point",
          args: { group_type: "Plant" }
        },
        offset: {
          kind: "coordinate",
          args: { x: 0, y: 0, z: 0 }
        },
        speed: 100
      }
    })
    check1 = CeleryScript::Checker.new(not_ok, corpus, device)
    expect(check1.valid?).to eq(false)
    expect(check1.error.message).to eq(CeleryScriptSettingsBag::ONLY_ONE_COORD)
  end

  it "handles valid move_absolute blocks" do
    ok1 = CeleryScript::AstNode.new({
      kind: "move_absolute",
      args: {
        location: {
          kind: "coordinate",
          args: {
            x: 1,
            y: 2,
            z: 3
          }
        },
        offset: {
          kind: "coordinate",
          args: {
            "x": 0,
            "y": 0,
            "z": 0
          }
        },
        speed: 100
      }
    })
    check1 = CeleryScript::Checker.new(ok1, corpus, device)
    expect(check1.valid?).to be_truthy

    ok2 = CeleryScript::AstNode.new({
      kind: "move_absolute",
      args: {
        location: {
          kind: "tool",
          args: { tool_id: FactoryBot.create(:tool).id }
        },
        offset: {
          kind: "coordinate",
          args: {
            "x": 0,
            "y": 0,
            "z": 0
          }
        },
        speed: 100
      }
    })
    check2 = CeleryScript::Checker.new(ok2, corpus, device)
    expect(check2.valid?).to be_truthy
  end

  it "kicks back invalid move_absolute nodes" do
    bad = CeleryScript::AstNode.new({
      kind: "move_absolute",
      args: {
        location: 42,
        speed: 100,
        offset: {
          kind: "coordinate",
          args: {
            "x": 0,
            "y": 0,
            "z": 0
          }
        },
      }
    })
    check = CeleryScript::Checker.new(bad, corpus, device)
    expect(check.valid?).to be_falsey
    expect(check.error.message).to include("but got Integer")
    expect(check.error.message).to include("'location' within 'move_absolute'")
  end

  it "finds problems with nested nodes" do
    bad = CeleryScript::AstNode.new({
      kind: "move_absolute",
      args: {
        location: {
          kind: "tool",
          # Invalid:
          args: { tool_id: "PROBLEM!" }
        },
        offset: {
          kind: "coordinate",
          args: {
            "x": 0,
            "y": 0,
            "z": 0
          }
        },
        speed: 100
      }
    })
    check = CeleryScript::Checker.new(bad, corpus, device)
    expect(check.valid?).to be_falsey
    expect(check.error.message).to include("but got String")
  end

  it "serializes into JSON" do
      result = JSON.parse(corpus.to_json)

      expect(result["tag"]).to eq(Sequence::LATEST_VERSION)
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
    tree = CeleryScript::AstNode.new({
      "kind": "send_message",
      "args": {
        "message": "Hello, world!",
        "message_type": "wrong"
      },
      "body": []
    })
    checker = CeleryScript::Checker.new(tree, corpus, device)
    expect(checker.error.message).to include("not a valid message_type")
  end

  it "Handles channel_name validations for version 1" do
    # This test is __ONLY__ relevant for version 1.
    # Change / delete / update as needed.
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
    checker = CeleryScript::Checker.new(tree, corpus, device)
    expect(checker.error.message).to include("not a valid channel_name")
  end

  it "validates tool_ids" do
    ast = { "kind": "tool", "args": { "tool_id": 0 } };
    checker = CeleryScript::Checker.new(CeleryScript::AstNode.new(ast),
                                        corpus,
                                        device)
    expect(checker.valid?).to be(false)
    expect(checker.error.message).to include("Tool #0 does not exist.")
  end

  it "Validates resource_update nodes" do
    ast = { "kind": "resource_update",
            "args": { "resource_type" => "Device",
                      "resource_id"   => 23, # Mutated to "0" later..
                      "label"         => "mounted_tool_id",
                      "value"         => 1 } }
    checker = CeleryScript::Checker.new(CeleryScript::AstNode.new(ast), corpus, device)
    expect(checker.valid?).to be(true)
    expect(checker.tree.args[:resource_id].value).to eq(0)
  end

  it "rejects bogus resource_updates" do
    fake_id = FakeSequence.create().id + 1
    expect(Sequence.exists?(fake_id)).to be(false)
    ast = { "kind": "resource_update",
            "args": { "resource_type" => "Sequence",
                      "resource_id"   => fake_id,
                      "label"         => "foo",
                      "value"         => "Should Fail" } }
    hmm = CeleryScript::AstNode.new(ast)
    expect(hmm.args.fetch(:resource_id).value).to eq(fake_id)
    checker = CeleryScript::Checker.new(hmm, corpus, device)
    expect(checker.valid?).to be(false)
    expect(checker.error.message)
      .to eq("Can't find Sequence with id of #{fake_id}")
  end

  it "rejects bogus resource_types" do
    ast = { "kind": "resource_update",
            "args": { "resource_type" => "CanOpener",
                      "resource_id"   => 0,
                      "label"         => "foo",
                      "value"         => "Should Fail" } }
    checker = CeleryScript::Checker.new(CeleryScript::AstNode.new(ast),
                                        corpus,
                                        device)
    expect(checker.valid?).to be(false)
    expect(checker.error.message)
      .to include('"CanOpener" is not a valid resource_type.')
  end
end
