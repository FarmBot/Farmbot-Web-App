require "spec_helper"
require_relative "./flat_ir_helpers"

describe CeleryScript::FetchCelery do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  it "marks in_use as false when not in use" do
    in_use = \
      CeleryScript::FetchCelery.run!(sequence: FakeSequence.create())[:in_use]
    expect(in_use).to be(false)
  end

  it "marks a sequence as in_use by Regimen" do
    sequence = FakeSequence.create()
    ri       = RegimenItem.new(time_offset: 100, sequence_id: sequence.id)
    regimen  = FactoryBot.create(:regimen, regimen_items: [ri])
    results  = CeleryScript::FetchCelery.run!(sequence: sequence)

    expect(results[:in_use]).to be(true)
  end

  it "marks a sequence as in_use by FarmEvent" do
    fe       = FactoryBot.create(:farm_event)
    sequence = fe.executable
    results  = CeleryScript::FetchCelery.run!(sequence: sequence)

    expect(results[:in_use]).to be(true)
  end

  it "marks a sequence as in_use by Sequence" do
    sequence = FakeSequence.create()
    user     = FakeSequence.create(body: [
      { kind: "execute", args: { sequence_id: sequence.id } }
    ])
    results  = CeleryScript::FetchCelery.run!(sequence: sequence)
    expect(results[:in_use]).to be(true)
  end

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

    expected[:body].each_with_index do |item, index|
      x = actual[:body][index]
      y = expected[:body][index]
      expect(HashDiff.diff(x, y)).to eq([])
    end
    expected[:args][:locals][:body] ||= []
    actual[:args][:locals][:body]   ||= []
    comparison = [actual, expected].map{|x| x.except("updated_at", "created_at") }
    expect(HashDiff.diff(*comparison)).to eq([])
  end
end
