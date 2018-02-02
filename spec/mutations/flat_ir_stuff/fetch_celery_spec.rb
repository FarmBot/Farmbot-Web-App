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
    params = CeleryScript::FlatIrHelpers.typical_sequence
    params[:device] = device
    known_good = Sequences::Create.run!(params)
    actual   = CeleryScript::FetchCelery.run!(sequence: known_good.reload)
    expected = known_good
      .as_json
      .deep_symbolize_keys
      .without(:device_id, :migrated_nodes)
    expect(actual[:body]).to be_kind_of(Array)
    expected[:body]
      .each_with_index do |item, index|
        x = actual[:body][index]
        y = expected[:body][index]
        expect(HashDiff.diff(x, y)).to eq([])
      end
    expect(HashDiff.diff(actual, expected)).to eq([])
  end
end
