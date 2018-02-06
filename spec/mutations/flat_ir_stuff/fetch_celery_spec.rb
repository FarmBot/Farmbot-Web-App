require "spec_helper"
require_relative "./flat_ir_helpers"

describe CeleryScript::FetchCelery do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  __NOTHING______ = "nothing"
  # PART_0 = {"id"=>98,
  # "device_id"=>243,
  # "name"=>"Every Node",
  # "color"=>"gray",
  # "kind"=>"sequence",
  # "args"=>{"locals"=>{"kind"=>"scope_declaration", "args"=>{}}, "version"=>6, "is_outdated"=>false},
  # "body"=>
  #  [{"kind"=>"move_absolute",
  #    "args"=>
  #     {"offset"=>{"kind"=>"coordinate", "args"=>{"x"=>0, "y"=>0, "z"=>0}},
  #      "speed"=>100,
  #      "location"=>{"args"=>{"tool_id"=>43}, "kind"=>"tool"}}},
  #   {"kind"=>"move_relative", "args"=>{"x"=>4, "y"=>5, "z"=>6, "speed"=>100}},
  #   {"kind"=>"write_pin", "args"=>{"pin_number"=>1, "pin_value"=>2, "pin_mode"=>0}},
  #   {"kind"=>"read_pin", "args"=>{"pin_number"=>4, "pin_mode"=>0, "label"=>"foo"}},
  #   {"kind"=>"wait", "args"=>{"milliseconds"=>4}},
  #   {"kind"=>"send_message", "args"=>{"message"=>"Bot is at position {{ x }}, {{ y }}, {{ z }}.", "message_type"=>"success"}},
  #   {"kind"=>"_if",
  #    "args"=>
  #     {"lhs"=>"x",
  #      "op"=>"is",
  #      "rhs"=>0,
  #      "_then"=>{"kind"=>"execute", "args"=>{"sequence_id"=>97}},
  #      "_else"=>{"kind"=>"nothing", "args"=>{}}}},
  #   {"kind"=>"execute", "args"=>{"sequence_id"=>97}},
  #   {"kind"=>"execute_script", "args"=>{"label"=>"plant-detection"}},
  #   {"kind"=>"take_photo", "args"=>{}},
  #   {"kind"=>"move_absolute",
  #    "args"=>
  #     {"offset"=>{"kind"=>"coordinate", "args"=>{"x"=>0, "y"=>0, "z"=>0}},
  #      "speed"=>100,
  #      "location"=>{"args"=>{"x"=>1, "y"=>2, "z"=>3}, "kind"=>"coordinate"}}}],
  # "updated_at"=>Mon, 05 Feb 2018 21:57:08 UTC +00:00,
  # "created_at"=>Mon, 05 Feb 2018 21:57:07 UTC +00:00,
  # "migrated_nodes"=>true}

  # it "Makes JSON that is identical to the legacy implementation - part 0" do
  #   [
  #     #KIND                 PARENT           NEXT             BODY
  #     ["nothing",           __NOTHING______, __NOTHING______, __NOTHING______],
  #     ["sequence",          __NOTHING______, __NOTHING______, "move_absolute"],
  #     ["move_absolute",     "sequence",      "move_relative", __NOTHING______],
  #     ["coordinate",        "move_absolute", __NOTHING______, __NOTHING______],
  #     ["move_relative",     "move_absolute", "write_pin",     __NOTHING______],
  #     ["write_pin",         "move_relative", __NOTHING______, __NOTHING______],
  #     ["scope_declaration", "sequence",      __NOTHING______, __NOTHING______],
  #   ].map do |(me, expect_parent, expect_next, expect_body)|
  #     inspected = nodes.find_by(kind: me)
  #     expect(inspected.parent.kind).to eq(expect_parent)
  #     # expect(inspected.next.kind).to   eq(expect_next)
  #     expect(inspected.body.kind).to   eq(expect_body)
  #   end
  # end

  it "Makes JSON that is identical to the legacy implementation - part 1" do
    pending("The `hash` and `actual` variables are wrong.")
    Sequence.all.destroy_all
    expect(Sequence.count).to eq(0)
    expect(PrimaryNode.count).to eq(0)
    expect(EdgeNode.count).to eq(0)
    params          = CeleryScript::FlatIrHelpers.typical_sequence
    params[:device] = device
    hash            = Sequences::Create.run!(params)
    actual          = CeleryScript::FetchCelery
      .run!(sequence: Sequence.find(hash[:id]))
    expected        = hash.without(:device_id, :migrated_nodes)
    expect(actual[:body]).to be_kind_of(Array)
    nodes = Sequence.find(actual[:id]).primary_nodes
    # This table came from the JS implementation, which is "known good".
    [
      #KIND                 PARENT           NEXT             BODY
      ["nothing",           __NOTHING______, __NOTHING______, __NOTHING______],
      # ["sequence",        __NOTHING______, __NOTHING______, "move_absolute"],
      ["move_absolute",     "sequence",      "move_relative", __NOTHING______],
      ["coordinate",        "move_absolute", __NOTHING______, __NOTHING______],
      ["move_relative",     "move_absolute", "write_pin",     __NOTHING______],
      ["write_pin",         "move_relative", __NOTHING______, __NOTHING______],
      ["scope_declaration", "sequence",      __NOTHING______, __NOTHING______],
    ].map do |(me, expect_parent, expect_next, expect_body)|
      inspected = nodes.find_by(kind: me)
      expect(inspected.parent.kind)
        .to(eq(expect_parent), "BAD PARENT_ID: #{inspected.kind}")
      expect(inspected.next.kind)
        .to(eq(expect_next), "BAD NEXT_ID: #{inspected.kind}")
      expect(inspected.body.kind)
        .to(eq(expect_body), "BAD BODY_ID: #{inspected.kind}")
    end

    expected[:body]
      .each_with_index do |item, index|
        x = actual[:body][index]
        y = expected[:body][index]
        expect(HashDiff.diff(x, y)).to eq([])
      end
      expected[:args][:locals][:body] ||= []
      actual[:args][:locals][:body]   ||= []
      expect(HashDiff.diff(actual, expected)).to eq([])
  end
end
