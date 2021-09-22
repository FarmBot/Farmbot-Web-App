require "spec_helper"

describe Api::SequencesController do
  include Devise::Test::ControllerHelpers
  describe "#unpublish" do
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }
    let(:sequence) { FakeSequence.create(device: user.device) }

    before :each do
      request.headers["accept"] = "application/json"
      sign_in user
    end

    it "unpublishes a shared sequence via #unpublish" do
      sp = Sequences::Publish.run!(sequence: sequence,
                                   device: device,
                                   copyright: "FarmBot, Inc. 2021")
      expect(sp.published).to be(true)
      post :unpublish, params: { format: :json, id: sequence.id }
      expect(response.ok?).to be(true)
      expect(sp.reload.published).to be(false)
    end
  end
end
