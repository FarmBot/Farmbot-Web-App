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
    none = "nothing"
    [
      # Came from the JS implementation which is known good.
      #KIND                 PARENT           NEXT             BODY
      ["nothing",           none,            "sequence",      none           ],
      ["sequence",          none,            none,            "move_absolute"],
      ["move_absolute",     "sequence",      "move_relative", none           ],
      ["coordinate",        "move_absolute", none,            none           ],
      ["move_relative",     "move_absolute", "write_pin",     none           ],
      ["write_pin",         "move_relative", none,            none           ],
      ["scope_declaration", "sequence",      none,            none           ],
    ].map do |(me, expect_parent, expect_next, expect_body)|
      puts "I NEED TO VALIDATE parent_arg_name"
      binding.pry
    end

    expected[:body]
      .each_with_index do |item, index|
        x = actual[:body][index]
        y = expected[:body][index]
        expect(HashDiff.diff(x, y)).to eq([])
      end
    expect(HashDiff.diff(actual, expected)).to eq([])
  end
end
