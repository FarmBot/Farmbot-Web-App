require "spec_helper"
require_relative "./flat_ir_helpers"

describe CeleryScript::FirstPass do
  let :result do
    Sequence.all.destroy_all
    expect(EdgeNode.count).to eq(0)
    expect(PrimaryNode.count).to eq(0)
    CeleryScript::FlatIrHelpers.fake_first_pass
  end

  kind   = CeleryScript::Slicer::KIND
  parent = CeleryScript::Slicer::PARENT
  next_  = CeleryScript::Slicer::NEXT
  body   = CeleryScript::Slicer::BODY

  CORRECT_LINKAGE = { # Came from the JS implementation which is known good.
    0 => { kind => "nothing",           parent => 0, next_ => 0 },
    1 => { kind => "sequence",          parent => 0, body  => 2 },
    2 => { kind => "move_absolute",     parent => 1, next_ => 3 },
    3 => { kind => "coordinate",        parent => 2, next_ => 0 },
    4 => { kind => "coordinate",        parent => 2, next_ => 0 },
    5 => { kind => "move_relative",     parent => 2, next_ => 6 },
    6 => { kind => "write_pin",         parent => 5, next_ => 0 },
    7 => { kind => "scope_declaration", parent => 1, next_ => 0 }
  }

  fit "Hmmm..." do
    x        = CeleryScript::FlatIrHelpers.typical_sequence
    sequence = FactoryBot.create(:sequence, args: x[:args], body: x[:body])
    step1    = CeleryScript::FirstPass.run!(sequence: sequence)

    CORRECT_LINKAGE.to_a.map do |(index, correct)|
      real = step1[index]
      [
        [real[:kind  ], correct[kind  ], kind  ],
        [real[:parent], correct[parent], parent],
        [real[:next  ], correct[next_ ], next_ ],
        [real[:body  ], correct[body  ], body  ],
      ]
      .each_with_index do |(actual, expected, key), index|
      be_right = [
        eq(expected || 0),
        "Expected #{key} at index #{index} to be #{expected} got #{actual}"
      ]
      expect(actual).to(*be_right)
    end
    end
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

  it "travels down the tree via `body`" do
    top = result[1] # 0 is NULL
    expect(top[:kind]).to eq("sequence")

    child1 = result[top[:body]]
    expect(child1[:kind]).to eq("send_message")

    child2 = result[child1[:body]]
    expect(child2[:kind]).to eq("channel")
  end

  it "sets edge_nodes (but not primary_nodes)" do
    top = result[1] # 0 is NULL
    expect(top[:edge_nodes].keys).to eq([])

    child1 = result[top[:body]]
    expect(child1[:edge_nodes][:message]).to eq("test case 1")
    expect(child1[:edge_nodes][:message_type]).to eq("success")

    child2 = result[child1[:body]]
    expect(child2[:edge_nodes][:channel_name]).to eq("toast")
  end
end