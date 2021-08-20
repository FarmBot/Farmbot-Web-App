require "spec_helper"

describe Api::SequencesController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:other_device) { FactoryBot.create(:user).device }

  it "disallows denied nodes"
  it "disallows denied args"
  it "re-publishes changes"
  it "publishes a valid sequence"
  it "disallows publishing other people's stuff" do
    expect do
      Sequences::Publish.run!(sequence: fake_sequence(device: other_device),
                              device: device)
    end.to raise_error(Errors::Forbidden)
  end

  it "publishes an empty sequence" do
    sequence = fake_sequence(device: device)
    expect(sequence.device_id).to eq(device.id)
    Sequences::Publish.run!(sequence: sequence, device: device)
  end

  def fake_sequence(input)
    FakeSequence.with_parameters(input)
  end
end
