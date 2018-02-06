require "spec_helper"
require_relative "./flat_ir_helpers"

describe CeleryScript::SecondPass do
  let :result do
    Sequence.all.destroy_all
    expect(EdgeNode.count).to eq(0)
    expect(PrimaryNode.count).to eq(0)
    CeleryScript::SecondPass.run!(nodes: CeleryScript::FlatIrHelpers.fake_first_pass)
  end

  # it "handles edge cases" do
  #   x        = CeleryScript::FlatIrHelpers.typical_sequence
  #   sequence = FactoryBot.create(:sequence, args: x[:args], body: x[:body])
  #   step1    = CeleryScript::FirstPass.run!(sequence: sequence)
  #   step2    = CeleryScript::SecondPass.run!(nodes: step1)
  #   comparison = step2
  #     .map(&:as_json)
  #     .map(&:symbolize_keys)
  #     .map { |x| x.slice(:id, :kind, :next_id, :body_id, :parent_id) }
  #     .index_by { |x| x[:id] }
  #   comparison
  #     .values
  #     .map do |value|
  #       puts """
  #       === Node \##{value[:id]} (#{value[:kind]})
  #       parent: #{(comparison[value[:parent_id]] || {})[:kind] || "nil"}
  #       body  : #{(comparison[value[:body_id]] || {})[:kind] || "nil"}
  #       next  : #{(comparison[value[:next_id]] || {})[:kind] || "nil"}
  #       """
  #     end
  # end

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
    expect(sequence.body).to be
    expect(sequence.parent).to eq(nothing)
    expect(sequence.body).to eq(send_message)
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