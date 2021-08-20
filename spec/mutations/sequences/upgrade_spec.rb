require "spec_helper"

describe Sequences::Upgrade do
  body = [
    { "kind" => "move_absolute",
     "args" => { "location" => { "kind" => "coordinate",
                                "args" => { "x" => 0,
                                            "y" => 0,
                                            "z" => 0 } },
                 "offset" => { "kind" => "coordinate",
                              "args" => { "x" => 0,
                                          "y" => 0,
                                          "z" => 0 } },
                 "speed" => 100 } },
    { "kind" => "move_relative",
      "args" => { "x" => 0, "y" => 0, "z" => 0, "speed" => 100 } },
  ]

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:other_device) { FactoryBot.create(:user).device }
  let(:sequence) { fake_sequence(device: device, body: body) }

  it "installs a specific sequence version" do
    # Create a shared sequence
    pub_seq = fake_sequence(device: other_device,
                            color: "red",
                            name: "upstream")
    sv = Sequences::Publish
      .run!(device: other_device, sequence: pub_seq)
      .sequence_versions
      .first
    # Create a sequence owned by someone else
    body = [{ kind: "wait", args: { milliseconds: 3000 } }]
    priv_seq = fake_sequence(device: device,
                             body: body,
                             color: "red",
                             name: "forked")
    # Upgrade to thepub_seq of someone elses account
    Sequences::Upgrade.run!(device: device,
                            sequence: priv_seq,
                            sequence_version: sv)
    expect(EdgeNode.where(sequence_id: priv_seq.id).count).to eq(0)
    expect(PrimaryNode.where(sequence_id: priv_seq.id).count).to eq(0)
    expect(priv_seq.name).to eq(pub_seq.name)
    expect(priv_seq.color).to eq(pub_seq.color)
    expect(priv_seq.device).to eq(device)
    expect(priv_seq.forked).to eq(false)
    expect(priv_seq.sequence_version_id).to eq(sv.id)
  end

  it "does not let you upgrade other peoples sequences" do
    pub_seq = fake_sequence(device: other_device,
                            color: "red",
                            name: "upstream")
    sv = Sequences::Publish
      .run!(device: other_device, sequence: pub_seq)
      .sequence_versions
      .first
    err = "Can't upgrade sequences you didn't create."
    expect do
      Sequences::Upgrade.run(device: other_device,
                             sequence: sequence,
                             sequence_version: sv)
    end.to raise_error(Errors::Forbidden, err)
  end

  it "does not allow upgrade of unpublished sequeces" do
    pub_seq = fake_sequence(device: other_device, color: "red", name: "---")
    Sequences::Publish.run!(device: other_device, sequence: pub_seq)
    publication = Sequences::Unpublish.run!(device: other_device, sequence: pub_seq)
    sv = publication.sequence_versions.sample
    mut = Sequences::Upgrade.run(device: device,
                                 sequence_version: sv,
                                 sequence: fake_sequence(device: device))
    msg = "Can't install unpublished sequences"
    expect(mut.errors["sequence_version"].message).to eq(msg)
  end

  def fake_sequence(input)
    FakeSequence.with_parameters(input)
  end
end
