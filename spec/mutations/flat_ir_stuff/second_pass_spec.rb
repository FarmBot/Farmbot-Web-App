require "spec_helper"
require_relative "./flat_ir_helpers"

describe SecondPass do
  let :result do
    Sequence.all.destroy_all
    expect(EdgeNode.count).to eq(0)
    expect(PrimaryNode.count).to eq(0)
    all = SecondPass.run!(nodes: FlatIrHelpers.fake_first_pass)
    all.map(&:save!)
    all.map(&:reload)
    all
  end

  it "wires stuff up" do
    expect(result.map(&:class).uniq).to eq([PrimaryNode])
    expect(result.length).to eq(11)
    expect(result.map(&:sequence_id).uniq.length).to eq(1)
  end

  fit "references parent/children correctly" do
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
    expect(sequence.child_id).to eq(send_message.id)
  end

  it "sets proper parent_arg_name"
end