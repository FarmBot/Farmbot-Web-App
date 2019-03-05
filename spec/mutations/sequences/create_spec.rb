require 'spec_helper'

describe Sequences::Create do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:body) { sequence_body_for(user) }

  name = Faker::Games::Pokemon.name
  let(:sequence_params) do
    { device: device,
      name: name,
      body: body }
  end

  it 'Builds a `sequence`' do
    seq = Sequences::Create.run!(sequence_params)
    expect(seq[:name]).to eq(name)
    expect(Sequence.find(seq[:id]).device).to eq(device)
  end

  it 'Gives validation errors for malformed AST nodes' do
    move_abs = body.select{ |x| x["kind"] == "move_absolute" }.first
    move_abs["args"]["location"]["args"]["x"] = "not a number"
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expect(seq.errors["body"].message).to include("but got String")
  end

  it 'Gives validation errors for malformed pin_mode' do
    pin_write = body.select{ |x| x["kind"] == "write_pin" }.first
    pin_write["args"]["pin_mode"] = -9
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expectation = '"-9" is not a valid pin_mode.'
    expect(seq.errors["body"].message).to include(expectation)
  end

  it 'Gives validation errors for malformed sequence_id' do
    body[7]["args"]["_then"]["args"]["sequence_id"] = -1
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expectation = "Sequence #-1 does not exist."
    expect(seq.errors["body"].message).to include(expectation)
  end

  it 'Gives validation errors for malformed LHS' do
    body.select{ |x| x["kind"] == "_if" }.first["args"]["lhs"] = "xyz"
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expected = "Can not put \"xyz\" into a left hand side (LHS) argument."
    expect(seq.errors["body"].message).to include(expected)
  end

  it 'Gives validation errors for malformed OP' do
    body.select{ |x| x["kind"] == "_if" }.first["args"]["op"] = "was"
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expected = "Can not put \"was\" into an operand (OP) argument."
    expect(seq.errors["body"].message).to include(expected)
  end

  it 'builds a send_message sequence' do
    app = {
      name: "New Sequence",
      color: "gray",
      device: device,
      kind: "sequence",
      args: {},
      body: [
        {
          kind: "send_message",
          args: {
            message: "Hello, world!",
            message_type: "warn"
          },
          body: [
            {
              kind: "channel",
              args: {
                channel_name: "toast"
              }
            }
          ]
        }
      ]
    }
    seq = Sequences::Create.run!(app)
    expect(seq.dig(:body, 0, :body, 0, "kind")).to eq("channel")
    expect(seq[:body].dig(0, :args, :message)).to eq("Hello, world!")
  end

  it "Strips UUIDs and other 'noises', leaves other attributes in tact. " do
    body = [
      { "kind" => "move_absolute",
        "args" => { "location" => { "kind" => "coordinate",
                                    "args" => { "x" => 0,
                                                "y" => 0,
                                                "z" => 0 } },
                    "offset"   => { "kind" => "coordinate",
                                    "args" => { "x" => 0,
                                                "y" => 0,
                                                "z" => 0 } },
                    "speed"    => 100 },
        "uuid" => "cce8ef3c-f35e-49c1-a39f-76624173632c" },
      { "kind" => "move_relative",
        "args" => { "x"     => 0,
                    "y"     => 0,
                    "z"     => 0,
                    "speed" => 100},
        "uuid"  => "5cf47f9d-0205-44d9-a0b6-44a148dc5a54"}
    ]
    result = Sequences::Create.run!({
      body:   body,
      device: device,
      color:  "gray",
      name:   "New Sequence",
    })
    expected    = result[:body].dig(0, "args", "location", "args")
    actual      = body.dig(0, "args", "location", "args")
    extra_stuff = result[:body].map{|x| x["uuid"]}.compact
    expect(extra_stuff.length).to eq(0)
    expect(expected).to eq(actual)
  end
end
