require "spec_helper"
require_relative "./flat_ir_helpers"
require_relative "../../../app/lib/celery_script/slicer"

describe CeleryScript::FirstPass do
  let :result do
    Sequence.all.destroy_all
    expect(EdgeNode.count).to eq(0)
    expect(PrimaryNode.count).to eq(0)
    CeleryScript::FlatIrHelpers.fake_first_pass
  end

  kind   = CeleryScript::CSHeap::KIND
  parent = CeleryScript::CSHeap::PARENT
  next_  = CeleryScript::CSHeap::NEXT
  body   = CeleryScript::CSHeap::BODY

  EXPECTATIONS = { # Came from the JS implementation which is known good.
    0 => { kind => "nothing",           parent => 0, next_ => 0 },
    1 => { kind => "sequence",          parent => 0, body  => 2 },
    2 => { kind => "move_absolute",     parent => 1, next_ => 3 },
    3 => { kind => "coordinate",        parent => 2, next_ => 0 },
    4 => { kind => "coordinate",        parent => 2, next_ => 0 },
    5 => { kind => "move_relative",     parent => 2, next_ => 6 },
    6 => { kind => "write_pin",         parent => 5, next_ => 0 },
    7 => { kind => "scope_declaration", parent => 1, next_ => 0 }
  }

  it "sets the correct parent" do
    parent_look_up = {
      "sequence"     => "nothing",
      "_if"          => "take_photo",
      "take_photo"   => "send_message",
      "send_message" => "sequence",
    }

    result
      .map do |node|
        expected_parent = parent_look_up[node.kind]
        expect(node.parent.kind).to eq(expected_parent) if expected_parent
      end
  end
  {
    kind: 'sequence',
    args: { locals: { kind: 'scope_declaration', args: {}, body: [] } },
    body: [
      {
        kind: 'send_message',
        args: { message: 'test case 1', message_type: 'success' },
        body: [
          { kind: 'channel', args: { channel_name: 'toast' } },
          { kind: 'channel', args: { channel_name: 'email' } },
          { kind: 'channel', args: { channel_name: 'espeak' } } # Test this.
        ],
      },
      { kind: 'take_photo', args: {} },
      {
        kind: '_if',
        args: {
          lhs: 'x',
          op: 'is',
          rhs: 0,
          _then: { kind: 'nothing', args: {} },
          _else: { kind: 'nothing', args: {} }
        }
      },
    ]
    }

  it "sets the correct next node" do
    next_node_look_up = { "nothing"      => "nothing",
                          "sequence"     => "nothing",
                          "send_message" => "take_photo",
                          "take_photo"   => "_if" }

    result
      .map do |node|
        xpected_next = next_node_look_up[node.kind]
        expect(node.next.kind).to eq(xpected_next) if xpected_next
      end
  end

  it "set the correct body nodes" do
    body_lookup = { "nothing"      => "nothing",
                          "sequence"     => "nothing",
                          "send_message" => "take_photo",
                          "take_photo"   => "_if" }

    result
      .map do |node|
        xpected_next = body_lookup[node.kind]
        expect(node.next.kind).to eq(xpected_next) if xpected_next
      end
  end

end
