require "spec_helper"

describe Api::SequencesController do
  include Devise::Test::ControllerHelpers
  describe "#publish" do
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }
    let(:sequence) { FakeSequence.create(device: user.device) }

    before :each do
      request.headers["accept"] = "application/json"
      sign_in user
    end

    it "authors a shared sequence via #publish" do
      post :publish, params: {
                       format: :json,
                       id: sequence.id,
                       copyright: "FarmBot, Inc. 2021",
                     }
      expect(response.ok?).to be(true)
      expect(json[:cached_author_email]).to eq(user.email)
      expect(json[:author_device_id]).to eq(device.id)
      expect(json[:author_sequence_id]).to eq(sequence.id)
      expect(json[:published]).to be(true)
    end
  end
end
