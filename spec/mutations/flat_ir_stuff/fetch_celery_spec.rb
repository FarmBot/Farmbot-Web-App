require          "spec_helper"
USE_CASE = {
  kind: "sequence",
  name: "move_abs(1,2,3), move_rel(4,5,6), write_pin(13, off, digital)",
  color: "gray",
  args: {
    locals: { kind: "scope_declaration", args: {}, body: [] },
    version: 6,
    label: "move_abs(1,2,3), move_rel(4,5,6), write_pin(13, off, digital)"
  },
  body: [
    {
      kind: "move_absolute",
      args: {
        location: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
        offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
        speed: 100
      }
    },
    {
      kind: "move_relative",
      args: { x: 0, y: 0, z: 0, speed: 100 }
    },
    {
      kind: "write_pin",
      args: { pin_number: 0, pin_value: 0, pin_mode: 0 }
    }
  ]
}

describe CeleryScript::FetchCelery do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  it "has edge cases" do
    s        = Sequences::Create.run!(USE_CASE, device: device)
    expected = CeleryScript::FetchCelery.run!(sequence: Sequence.find(s.id))
    expect(HashDiff.diff(USE_CASE, expected)).to eq([])
  end

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
