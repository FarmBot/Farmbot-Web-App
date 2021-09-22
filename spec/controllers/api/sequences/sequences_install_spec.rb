require "spec_helper"

describe Api::SequencesController do
  include Devise::Test::ControllerHelpers
  describe "#install" do
    let(:author) { FactoryBot.create(:user) }
    let(:author_device) { author.device }
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }
    let(:sequence) { FakeSequence.create(device: author_device) }

    before :each do
      request.headers["accept"] = "application/json"
      sign_in user
    end

    it "installs a shared sequence via #install" do
      sp = Sequences::Publish.run!(sequence: sequence,
                                   device: author_device,
                                   copyright: "FarmBot, Inc. 2021")
      sv = sp.sequence_versions.last
      post :install, params: { format: :json, sequence_version_id: sv.id }
      expect(response.ok?).to be(true)
    end
  end
end
