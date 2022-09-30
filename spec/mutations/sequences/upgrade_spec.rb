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
  let(:sequence) { FakeSequence.with_parameters(device: device, body: body) }

  it "upgrades to a specific sequence version" do
    # Create a shared sequence
    pub_seq = FakeSequence.with_parameters(device: other_device,
                                           description: "description",
                                           color: "red",
                                           name: "upstream")
    sv = Sequences::Publish
      .run!(device: other_device, sequence: pub_seq, copyright: "FarmBot, inc.")
      .sequence_versions
      .first
    # Create a sequence owned by someone else
    body = [{ kind: "wait", args: { milliseconds: 3000 } }]
    priv_seq = FakeSequence.with_parameters(device: device,
                                            body: body,
                                            color: "red",
                                            name: "forked")
    # Upgrade to the pub_seq of someone elses account
    Sequences::Upgrade.run!(device: device,
                            sequence: priv_seq,
                            sequence_version: sv)
    expect(EdgeNode.where(sequence_id: priv_seq.id).count).to eq(0)
    expect(PrimaryNode.where(sequence_id: priv_seq.id).count).to eq(0)
    expect(priv_seq.name).to eq(pub_seq.name)
    expect(priv_seq.color).to eq(pub_seq.color)
    expect(priv_seq.description).to eq(pub_seq.description)
    expect(priv_seq.device).to eq(device)
    expect(priv_seq.forked).to eq(false)
    expect(priv_seq.sequence_version_id).to eq(sv.id)
    # After upgrading once, the `name` and `color` attrs
    # should keep downstream changes
    priv_seq.update!(name: "changed by end user", color: "blue", description: "x")
    Sequences::Upgrade.run!(device: device, sequence: priv_seq, sequence_version: sv)
    priv_seq.reload
    expect(priv_seq.color).to eq("blue")
    expect(priv_seq.name).to eq("changed by end user")
    expect(priv_seq.description).to eq("description")
  end

  it "does not let you upgrade other peoples sequences" do
    pub_seq = FakeSequence.with_parameters(device: other_device,
                                           color: "red",
                                           name: "upstream")
    sv = Sequences::Publish
      .run!(device: other_device, sequence: pub_seq, copyright: "FarmBot, Inc.")
      .sequence_versions
      .first
    err = "Can't upgrade sequences you didn't create."
    expect do
      Sequences::Upgrade.run(device: other_device,
                             sequence: sequence,
                             sequence_version: sv)
    end.to raise_error(Errors::Forbidden, err)
  end

  it "does not allow upgrade of unpublished sequences" do
    pub_seq = FakeSequence.with_parameters(device: other_device, color: "red", name: "---")
    Sequences::Publish.run!(device: other_device,
                            sequence: pub_seq,
                            copyright: "FarmBot, Inc 2021")
    publication = Sequences::Unpublish.run!(device: other_device, sequence: pub_seq)
    sv = publication.sequence_versions.sample
    mut = Sequences::Upgrade.run(device: device,
                                 sequence_version: sv,
                                 sequence: FakeSequence.with_parameters(device: device))
    msg = "Can't install unpublished sequences"
    expect(mut.errors["sequence_version"].message).to eq(msg)
  end
end
