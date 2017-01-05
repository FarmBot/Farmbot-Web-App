require 'spec_helper'

describe Sequences::Create do
  let(:user) { FactoryGirl.create(:user) }
  let(:device) { user.device }
  let(:body) { sequence_body_for(user) }

  name = Faker::Pokemon.name
  let(:sequence_params) do
    { device: device,
      name: name,
      body: body }
  end

  it 'Builds a `sequence`' do
    seq = Sequences::Create.run!(sequence_params)
    expect(seq.name).to eq(name)
    expect(seq.device).to eq(device)
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
    expectation = 'Can not put "-9" into a left hand side (LHS) argument.'
    expect(seq.errors["body"].message).to include(expectation)
  end

  it 'Gives validation errors for malformed sequence_id' do
    body[7]["args"]["_then"]["args"]["sequence_id"] = 0
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expectation = "Sequence #0 does not exist."
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
    expect(seq.body.first[:body].first["kind"]).to eq("channel")
    expect(seq.body.dig(0, :args, :message)).to eq("Hello, world!")
  end
end
