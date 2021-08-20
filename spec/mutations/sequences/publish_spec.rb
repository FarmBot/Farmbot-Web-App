require "spec_helper"

describe Sequences::Publish do
  body = [
    {
      kind: "send_message",
      args: { message: "has desc.", message_type: "warn" },
      body: [
        { kind: "channel", args: { channel_name: "toast" } },
      ],
    },
  ]

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:other_device) { FactoryBot.create(:user).device }
  let(:sequence) { fake_sequence(device: device, body: body) }

  it "allows override by admins"

  it "disallows denied nodes and args" do
    bad = fake_sequence(device: device, body: [
                          {
                            kind: "lua",
                            args: {
                              lua: "os.cmd('cat /etc/password')",
                            },
                          },
                        ])
    problems = Sequences::Publish.run(sequence: bad, device: device)
    expected = "For security reasons, we can't publish sequences " \
               "that contain the following content: lua"
    actual = problems.errors["sequence"].message
    expect(actual).to eq(expected)
  end

  it "re-publishes changes" do
    # ==== Create a sequence.
    expect(sequence.device_id).to eq(device.id)
    d1 = "descr. 1"
    # ==== Publish it.
    pub1 = Sequences::Publish.run!(sequence: sequence,
                                   device: device,
                                   description: d1)
    expect(pub1.sequence_versions.count).to eq(1)
    current_version = pub1.sequence_versions.first
    expect(pub1.cached_author_email).to eq(user.email)
    expect(current_version.description).to eq(d1)
    # ==== Update it.
    body2 = [
      {
        kind: "send_message",
        args: { message: "Updated", message_type: "warn" },
        body: [
          { kind: "channel", args: { channel_name: "toast" } },
        ],
      },
    ]
    json = Sequences::Update.run!(sequence: sequence,
                                  name: "My Sequence",
                                  device: device,
                                  body: body2)
    sequence2 = Sequence.find(json["id"])
    # ==== Re-Publish it.
    d2 = "descr. 2"
    pub2 = Sequences::Publish.run!(sequence: sequence2,
                                   device: device,
                                   description: d2)
    expect(pub2.sequence_versions.count).to eq(2)
    current_version = pub2.sequence_versions.last
    expect(pub2.cached_author_email).to eq(user.email)
    expect(current_version.description).to eq(d2)
  end

  it "publishes a sequence with option description field" do
    expect(sequence.device_id).to eq(device.id)
    description = "This is a description"
    publication = Sequences::Publish.run!(sequence: sequence,
                                          device: device,
                                          description: description)
    expect(publication.sequence_versions.count).to eq(1)
    current_version = publication.sequence_versions.first
    expect(publication.cached_author_email).to eq(user.email)
    expect(current_version.description).to eq(description)
  end

  it "disallows publishing other people's stuff" do
    expect do
      Sequences::Publish.run!(sequence: fake_sequence(device: other_device),
                              device: device)
    end.to raise_error(Errors::Forbidden)
  end

  it "publishes an empty sequence" do
    sequence = fake_sequence(device: device)
    expect(sequence.device_id).to eq(device.id)
    sp = Sequences::Publish.run!(sequence: sequence, device: device)
    expect(sp.published).to be(true)
  end

  def fake_sequence(input)
    FakeSequence.with_parameters(input)
  end
end
