require "spec_helper"
require_relative "./flat_ir_helpers"

describe CeleryScript::SecondPass do
  let :result do
    Sequence.all.destroy_all
    expect(EdgeNode.count).to eq(0)
    expect(PrimaryNode.count).to eq(0)
    CeleryScript::SecondPass.run!(nodes: CeleryScript::FlatIrHelpers.fake_first_pass)
  end

  it "handles edge cases" do
    x        = CeleryScript::FlatIrHelpers.typical_sequence
    sequence = FactoryBot.create(:sequence, args: x[:args], body: x[:body])
    step1    = CeleryScript::FirstPass.run!(sequence: sequence)
    step2    = CeleryScript::SecondPass.run!(nodes: step1)
    binding.pry
  end

  it "wires stuff up" do
    expect(result.map(&:class).uniq).to eq([PrimaryNode])
    expect(result.length).to eq(11)
    expect(result.map(&:sequence_id).uniq.length).to eq(1)
  end

  it "references parent/children correctly" do
    PrimaryNode.destroy_all
    EdgeNode.destroy_all
    nothing      = result.first
    sequence     = PrimaryNode.find_by(kind: "sequence")
    send_message = PrimaryNode.find_by(kind: "send_message")
    expect(PrimaryNode.where(kind: "sequence").count).to eq(1)
    expect(sequence.parent).to be
    expect(sequence.child).to be
    expect(sequence.parent).to eq(nothing)
    expect(sequence.child).to eq(send_message)
    expect(sequence.parent_id).to eq(nothing.id)
    expect(sequence.body_id).to eq(send_message.id)
  end

  it "sets proper parent_arg_name" do
    sequence = result.first.sequence
    count = PrimaryNode.where(sequence: sequence,
                              parent_arg_name: ["locals", "_else", "_then"]).count
    expect(count).to eq(3)
  end
end