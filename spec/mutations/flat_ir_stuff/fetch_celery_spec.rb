require "spec_helper"
require_relative "./flat_ir_helpers"

describe CeleryScript::FetchCelery do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  __NOTHING______ = "nothing"

  it "Makes JSON that is identical to the legacy implementation - part 1" do
    PinBinding.destroy_all
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
      ["sequence",          __NOTHING______, __NOTHING______, "move_absolute"],
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
