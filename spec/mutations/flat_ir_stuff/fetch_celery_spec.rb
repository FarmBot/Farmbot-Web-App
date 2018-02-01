require          "spec_helper"

describe CeleryScript::FetchCelery do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  it "Makes JSON that is identical to the legacy implementation" do
    Sequence.all.destroy_all
    expect(Sequence.count).to eq(0)
    expect(PrimaryNode.count).to eq(0)
    expect(EdgeNode.count).to eq(0)
    known_good = Sequences::Create.run!({
      name: "New Sequence",
      color: "gray",
      device: device,
      kind: "sequence",
      args: {},
      body: [
        { kind: "send_message",
          args: { message: "Hello, world!", message_type: "warn" },
          body: [{ kind: "channel", args: { channel_name: "toast" } }] }
      ]
    })
    actual   = CeleryScript::FetchCelery.run!(sequence: known_good.reload)
    expected = known_good
      .as_json
      .deep_symbolize_keys
      .without(:device_id, :migrated_nodes)
    expect(HashDiff.diff(actual, expected)).to eq([])
  end
end
