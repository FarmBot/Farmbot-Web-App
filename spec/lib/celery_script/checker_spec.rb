require "spec_helper"

describe CeleryScript::Checker do
  let(:device) { FactoryBot.create(:device) }
  let(:hash) do
    {
      kind: "sequence",
      args: {
        locals: Sequence::SCOPE_DECLARATION,
        version: 0,
      },
      comment: "Properly formatted, syntactically valid sequence.",
      body: sequence_body_for(FakeSequence.create()),
    }.deep_symbolize_keys
  end

  let(:tree) do
    CeleryScript::AstNode.new(hash)
  end

  let (:corpus) { Sequence::Corpus }

  let (:checker) { CeleryScript::Checker.new(tree, corpus, device) }

  it "disallows `change_ownership` on the server-side" do
    hash[:body] = [{ kind: "change_ownership", args: {} }]
    expect { checker.run! }.to raise_error("Never.")
  end

  it "runs through a syntactically valid program" do
    outcome = checker.run!
    expect(outcome).to be_kind_of(CeleryScript::AstNode)
    expect(outcome.comment).to eq("Properly formatted, syntactically valid" \
                                  " sequence.")
  end

  it "handles missing args" do
    tree.body.first.args[:location].args.delete(:x)
    expect(checker.valid?).to be(false)
    msg = checker.error.message
    expect(msg).to include("Expected node 'coordinate' to have a 'x'")
  end

  it "handles unknown args" do
    tree.body.first.args[:foo] = "bar"
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

  it "handles wrong leaf types" do
    hash[:body][0][:args][:location][:args][:x] = "supposed to be an Integer"
    result = checker.run
    expect(result.message).to eq("Expected leaf 'x' within 'coordinate' to be " \
                                 "one of: [Integer, Float] but got String")
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
    chk = CeleryScript::Checker.new(tree, corpus, device)
    expect(chk.valid?).to be false
    expect(chk.error.message).to eq("missing a sequence selection for `execute` block.")
  end

  it "validates peripheral presence" do
    hash[:body] = [
      {
        kind: "read_pin",
        args: {
          pin_number: {
            kind: "named_pin",
            args: {
              pin_type: "Peripheral",
              pin_id: 0,
            },
          },
          pin_mode: CeleryScriptSettingsBag::ANALOG,
          label: "FOO",
        },
      },
    ]
    chk = CeleryScript::Checker.new(tree, corpus, device)
    expect(chk.valid?).to be false
    expect(chk.error.message).to eq("Peripheral requires a valid pin number")
  end

  it "Catches bad `pin_type`s in `read_pin`" do
    hash[:body] = [
      {
        kind: "read_pin",
        args: {
          pin_mode: 0,
          label: "pin",
          pin_number: {
            kind: "named_pin",
            args: { pin_type: "Not correct", pin_id: 1 },
          },
        },
      },
    ]
    chk = CeleryScript::Checker.new(tree, corpus, device)
    expect(chk.valid?).to be false
    expect(chk.error.message).to include("not a type of pin")
  end

  it "Catches bad `pin_type`s in `read_pin`" do
    hash[:body] = [
      {
        kind: "read_pin",
        args: {
          pin_mode: CeleryScriptSettingsBag::ANALOG,
          label: "pin",
          pin_number: {
            kind: "named_pin",
            args: { pin_type: "Peripheral", pin_id: 900 },
          },
        },
      },
    ]
    chk = CeleryScript::Checker.new(tree, corpus, device)
    expect(chk.valid?).to be false
    expect(chk.error.message).to include("Can't find Peripheral with id of 900")
  end

  it 'allows "BoxLed3", "BoxLed4" as `pin_type`s' do
    hash[:body] = [
      {
        kind: "write_pin",
        args: {
          pin_value: 23,
          pin_mode: 0,
          pin_number: {
            kind: "named_pin",
            args: { pin_type: ["BoxLed3", "BoxLed4"].sample, pin_id: 41 },
          },
        },
      },
    ]
    chk = CeleryScript::Checker.new(tree, corpus, device)
    expect(chk.valid?).to be true
  end

  it 'disallows analog for "BoxLed3", "BoxLed4"' do
    hash[:body] = [
      {
        kind: "write_pin",
        args: {
          pin_value: 23,
          pin_mode: CeleryScriptSettingsBag::ANALOG,
          pin_number: {
            kind: "named_pin",
            args: { pin_type: ["BoxLed3", "BoxLed4"].sample, pin_id: 41 },
          },
        },
      },
    ]
    chk = CeleryScript::Checker.new(tree, corpus, device)
    expect(chk.valid?).to be false
    expect(chk.error.message).to include(CeleryScriptSettingsBag::CANT_ANALOG)
  end

  it 'gives human-friendly names to "BoxLed3", "BoxLed4"' do
    hash[:body] = [
      {
        kind: "write_pin",
        args: {
          pin_value: 23,
          pin_mode: CeleryScriptSettingsBag::DIGITAL,
          pin_number: {
            kind: "named_pin",
            args: { pin_type: ["BoxLed3", "BoxLed4"].sample, pin_id: 0 },
          },
        },
      },
    ]
    chk = CeleryScript::Checker.new(tree, corpus, device)
    expect(chk.valid?).to be false
    expected =
      CeleryScriptSettingsBag::NO_PIN_ID % CeleryScriptSettingsBag::BoxLed.name
    expect(chk.error.message).to eq(expected)
  end

  it "catches bad `axis` nodes" do
    t =
      CeleryScript::AstNode.new({ kind: "home", args: { speed: 100, axis: "?" } })
    chk = CeleryScript::Checker.new(t, corpus, device)
    expect(chk.valid?).to be false
    expect(chk.error.message).to include("not a valid axis")
  end

  it "catches bad `package` nodes" do
    t = CeleryScript::AstNode.new({ kind: "factory_reset", args: { package: "?" } })
    chk = CeleryScript::Checker.new(t, corpus, device)
    expect(chk.valid?).to be false
    expect(chk.error.message).to include("not a valid package")
  end

  it "handles good variable declarations" do
    ast = {
      kind: "sequence",
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          :args => {},
          body: [
            {
              kind: "parameter_declaration",
              args: {
                label: "parent",
                default_value: {
                  kind: "coordinate",
                  args: { x: 0, y: 0, z: 0 },
                },
              },
            },
          ],
        },
      },
      body: [
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: { kind: "identifier", args: { label: "parent" } },
            offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
          },
        },
      ],
    }
    tree = CeleryScript::AstNode.new(ast)
    chk = CeleryScript::Checker.new(tree, corpus, device)
    expect(chk.valid?).to be true
  end

  it "handles bad variable declarations" do
    ast = {
      kind: "sequence",
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          :args => {},
          body: [
            {
              kind: "parameter_declaration",
              args: {
                label: "parent",
                default_value: {
                  kind: "nothing",
                  args: {},
                },
              },
            },
          ],
        },
      },
      body: [
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: { kind: "identifier", args: { label: "parent" } },
            offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
          },
        },
      ],
    }
    tree = CeleryScript::AstNode.new(ast)
    chk = CeleryScript::Checker.new(tree, corpus, device)
    expect(chk.valid?).to be false
    message = "must provide a value for all parameters"
    expect(chk.error.message).to include(CeleryScript::Checker::MISSING_VAR)
  end
end
