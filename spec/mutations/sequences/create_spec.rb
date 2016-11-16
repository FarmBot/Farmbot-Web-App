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
    body.first["args"]["x"] = "not a number"
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expect(seq.errors["body"].message).to include("but got String")
  end

  it 'Gives validation errors for malformed pin_mode' do
    body[2]["args"]["pin_mode"] = -9
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expectation = 'Can not put "-9" into a left hand side (LHS) argument.'
    expect(seq.errors["body"].message).to include(expectation)
  end

  it 'Gives validation errors for malformed sub_sequence_id' do
    body[7]["args"]["sub_sequence_id"] = 0
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expectation = "Sequence #0 does not exist."
    expect(seq.errors["body"].message).to include(expectation)
  end

  it 'Gives validation errors for malformed LHS' do
    body[6]["args"]["lhs"] = "xyz"
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expected = "Can not put \"xyz\" into a left hand side (LHS) argument."
    expect(seq.errors["body"].message).to include(expected)
  end

  it 'Gives validation errors for malformed OP' do
    body[6]["args"]["op"] = "was"
    seq = Sequences::Create.run(sequence_params)
    expect(seq.success?).to be(false)
    expected = "Can not put \"was\" into an operand (OP) argument."
    expect(seq.errors["body"].message).to include(expected)
  end

  it 'builds a send_message sequence' do
    {
      name: "New Sequence",
      color: "gray",
      kind: "sequence",
      args: {},
      body: [
        {
          kind: "send_message",
          args: {
            message: "Hello, world!"
          },
          # DOES NOT EXIST YET.
          body: [
            {
              kind: "channel",
              args: { data_label: ""}
            }
          ]
        }
      ]
    }
    pending "Just found a new error with auth on the server."
  end
end
