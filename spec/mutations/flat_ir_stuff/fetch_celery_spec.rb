require "spec_helper"
require_relative "./flat_ir_helpers"

describe CeleryScript::FetchCelery do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  it "Makes JSON that is identical to the legacy implementation" do
    Sequence.all.destroy_all
    expect(Sequence.count).to eq(0)
    expect(PrimaryNode.count).to eq(0)
    expect(EdgeNode.count).to eq(0)
    params          = CeleryScript::FlatIrHelpers.typical_sequence
    params[:device] = device
    known_good      = Sequences::Create.run!(params)
    actual          = CeleryScript::FetchCelery.run!(sequence: known_good.reload)
    expected        = known_good
                        .as_json
                        .deep_symbolize_keys
                        .without(:device_id, :migrated_nodes)
    expect(actual[:body]).to be_kind_of(Array)
    nodes = Sequence.find(actual[:id]).primary_nodes
    _______________ = "nothing"
    # This table came from the JS implementation, which is "known good".
    [
      #KIND                 PARENT           NEXT             BODY
      ["nothing",           _______________, _______________, _______________],
      ["sequence",          _______________, _______________, "move_absolute"],
      ["move_absolute",     "sequence",      "move_relative", _______________],
      ["coordinate",        "move_absolute", _______________, _______________],
      ["move_relative",     "move_absolute", "write_pin",     _______________],
      ["write_pin",         "move_relative", _______________, _______________],
      ["scope_declaration", "sequence",      _______________, _______________],
    ].map do |(me, expect_parent, expect_next, expect_body)|
      inspected = nodes.find_by(kind: me)
      expect(inspected.parent.kind).to eq(expect_parent)
      # expect(inspected.next.kind).to   eq(expect_next)
      expect(inspected.body.kind).to   eq(expect_body)
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
