require "spec_helper"

describe Sequences::Install do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:other_device) { FactoryBot.create(:user).device }
  let(:sequence) { FakeSequence.with_parameters(device: device, body: body) }

  it "installs a specific sequence version" do
    pub_seq = FakeSequence.with_parameters(device: other_device, color: "red", name: "---")
    sv = Sequences::Publish
      .run!(device: other_device, sequence: pub_seq, copyright: "FarmBot, Inc.")
      .sequence_versions
      .first
    priv_seq = Sequences::Install.run!(device: device, sequence_version: sv)
    expect(priv_seq[:name]).to eq(pub_seq.name)
    expect(priv_seq[:color]).to eq(pub_seq.color)
    expect(priv_seq[:forked]).to eq(false)
    expect(priv_seq[:sequence_version_id]).to eq(sv.id)
  end

  it "does not allow installation of unpublished sequeces" do
    pub_seq = FakeSequence.with_parameters(device: other_device, color: "red", name: "---")
    Sequences::Publish.run!(device: other_device,
                            sequence: pub_seq,
                            copyright: "FarmBot, Inc. 2021")
    publication = Sequences::Unpublish.run!(device: other_device, sequence: pub_seq)
    sv = publication.sequence_versions.sample
    priv_seq = Sequences::Install.run(device: device, sequence_version: sv)
    msg = "Can't install unpublished sequences"
    expect(priv_seq.errors["sequence_version"].message).to eq(msg)
  end
end
