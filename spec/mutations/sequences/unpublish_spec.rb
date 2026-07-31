require "spec_helper"

describe Sequences::Unpublish do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:sequence) { FakeSequence.with_parameters(device: device) }
  let(:other_device) { FactoryBot.create(:user).device }

  it "unpublishes a sequence" do
    publication = Sequences::Publish.run!(sequence: sequence,
                                          device: device,
                                          copyright: "Farmbot, Inc 2021")
    version = publication.sequence_versions.first
    expect(publication.published).to be(true)
    expect(version.withdrawn_at).to be_nil
    Sequences::Unpublish.run!(device: device, sequence: sequence)
    expect(publication.reload.published).to be(false)
    expect(version.reload.withdrawn_at).to be_present
  end

  it "prevents unpublishing other users sequences" do
    expect do
      Sequences::Unpublish.run!(sequence: FakeSequence.with_parameters(device: other_device),
                                device: device)
    end.to raise_error(Errors::Forbidden)
  end
end
