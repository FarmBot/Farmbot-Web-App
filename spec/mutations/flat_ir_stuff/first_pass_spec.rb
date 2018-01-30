require "spec_helper"
require_relative "./flat_ir_helpers"

describe FirstPass do
  let :result do
    Sequence.all.destroy_all
    expect(EdgeNode.count).to eq(0)
    expect(PrimaryNode.count).to eq(0)
    FlatIrHelpers.fake_first_pass
  end

  it "travels up the tree via the `parent` property" do
    espeak_node = result.find do |x|
      x[:kind] === "channel" && x[:edge_nodes][:channel_name] === "email"
    end

    parent = result[espeak_node[:parent]]
    expect(parent[:kind]).to eq("channel")
    expect(parent[:edge_nodes][:channel_name]).to eq("toast")

    grandparent = result[parent[:parent]]
    expect(grandparent[:kind]).to eq("send_message")

    gr8_grandparent = result[grandparent[:parent]]
    expect(gr8_grandparent[:kind]).to eq("sequence")
  end

  it "travels down the tree via `child`" do
    top = result[1] # 0 is NULL
    expect(top[:kind]).to eq("sequence")

    child1 = result[top[:child]]
    expect(child1[:kind]).to eq("send_message")

    child2 = result[child1[:child]]
    expect(child2[:kind]).to eq("channel")
  end

  it "sets edge_nodes (but not primary_nodes)" do
    top = result[1] # 0 is NULL
    expect(top[:edge_nodes].keys).to eq([])

    child1 = result[top[:child]]
    expect(child1[:edge_nodes][:message]).to eq("test case 1")
    expect(child1[:edge_nodes][:message_type]).to eq("success")

    child2 = result[child1[:child]]
    expect(child2[:edge_nodes][:channel_name]).to eq("toast")
  end
end