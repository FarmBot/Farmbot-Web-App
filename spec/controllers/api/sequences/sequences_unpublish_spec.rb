require "spec_helper"

describe Api::SequencesController do
  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:sequence) { fake_sequence(device: device) }
  let(:other_device) { FactoryBot.create(:user).device }

  it "unpublishes a sequence" do
    publication = Sequences::Publish.run!(sequence: sequence, device: device)
    expect(publication.published).to be(true)
    Sequences::Unpublish.run!(device: device, sequence: sequence)
    expect(publication.reload.published).to be(false)
  end

  it "prevents unpublishing other users sequences" do
    expect do
      Sequences::Unpublish.run!(sequence: fake_sequence(device: other_device),
                                device: device)
    end.to raise_error(Errors::Forbidden)
  end

  def fake_sequence(input)
    FakeSequence.with_parameters(input)
  end
end
